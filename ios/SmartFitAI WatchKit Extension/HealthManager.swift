import Foundation
import HealthKit
import Combine

class HealthManager: NSObject, ObservableObject {
    @Published var caloriesBurned: Int = 0
    @Published var averageHeartRate: Int = 0
    @Published var workoutMinutes: Int = 0
    @Published var isAuthorized = false
    
    private let healthStore = HKHealthStore()
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        super.init()
        checkHealthKitAvailability()
    }
    
    private func checkHealthKitAvailability() {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("HealthKit is not available on this device")
            return
        }
    }
    
    func requestHealthKitPermissions() {
        let typesToRead: Set<HKObjectType> = [
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!,
            HKQuantityType.workoutType()
        ]
        
        let typesToShare: Set<HKObjectType> = [
            HKQuantityType.workoutType(),
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!
        ]
        
        healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.isAuthorized = success
                if success {
                    self?.fetchTodayStats()
                } else if let error = error {
                    print("HealthKit authorization failed: \(error.localizedDescription)")
                }
            }
        }
    }
    
    func fetchTodayStats() {
        fetchCaloriesBurned()
        fetchAverageHeartRate()
        fetchWorkoutMinutes()
    }
    
    private func fetchCaloriesBurned() {
        guard let caloriesType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else { return }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: caloriesType, quantitySamplePredicate: predicate, options: .cumulativeSum) { [weak self] _, result, error in
            guard let result = result, let sum = result.sumQuantity() else {
                if let error = error {
                    print("Error fetching calories: \(error.localizedDescription)")
                }
                return
            }
            
            DispatchQueue.main.async {
                self?.caloriesBurned = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
            }
        }
        
        healthStore.execute(query)
    }
    
    private func fetchAverageHeartRate() {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: heartRateType, quantitySamplePredicate: predicate, options: .discreteAverage) { [weak self] _, result, error in
            guard let result = result, let average = result.averageQuantity() else {
                if let error = error {
                    print("Error fetching heart rate: \(error.localizedDescription)")
                }
                return
            }
            
            DispatchQueue.main.async {
                self?.averageHeartRate = Int(average.doubleValue(for: HKUnit(from: "count/min")))
            }
        }
        
        healthStore.execute(query)
    }
    
    private func fetchWorkoutMinutes() {
        let workoutType = HKObjectType.workoutType()
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: endOfDay, options: .strictStartDate)
        
        let query = HKSampleQuery(sampleType: workoutType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { [weak self] _, samples, error in
            guard let workouts = samples as? [HKWorkout] else {
                if let error = error {
                    print("Error fetching workouts: \(error.localizedDescription)")
                }
                return
            }
            
            let totalMinutes = workouts.reduce(0) { total, workout in
                total + Int(workout.duration / 60)
            }
            
            DispatchQueue.main.async {
                self?.workoutMinutes = totalMinutes
            }
        }
        
        healthStore.execute(query)
    }
    
    func saveWorkout(workout: Workout, startDate: Date, endDate: Date) {
        guard isAuthorized else { return }
        
        let workoutConfiguration = HKWorkoutConfiguration()
        workoutConfiguration.activityType = .traditionalStrengthTraining
        workoutConfiguration.locationType = .indoor
        
        let workout = HKWorkout(
            activityType: workoutConfiguration.activityType,
            start: startDate,
            end: endDate,
            duration: endDate.timeIntervalSince(startDate),
            totalEnergyBurned: nil,
            totalDistance: nil,
            metadata: [
                HKMetadataKeyWorkoutBrandName: "SmartFit AI",
                HKMetadataKeyWorkoutName: workout.name
            ]
        )
        
        healthStore.save(workout) { success, error in
            if let error = error {
                print("Error saving workout: \(error.localizedDescription)")
            } else {
                print("Workout saved successfully")
            }
        }
    }
    
    func startHeartRateQuery() -> HKAnchoredObjectQuery? {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return nil }
        
        let query = HKAnchoredObjectQuery(
            type: heartRateType,
            predicate: nil,
            anchor: nil,
            limit: HKObjectQueryNoLimit
        ) { [weak self] _, samples, _, _, error in
            guard let heartRateSamples = samples as? [HKQuantitySample] else { return }
            
            let latestHeartRate = heartRateSamples.last?.quantity.doubleValue(for: HKUnit(from: "count/min")) ?? 0
            
            DispatchQueue.main.async {
                self?.averageHeartRate = Int(latestHeartRate)
            }
        }
        
        query.updateHandler = { [weak self] _, samples, _, _, _ in
            guard let heartRateSamples = samples as? [HKQuantitySample] else { return }
            
            let latestHeartRate = heartRateSamples.last?.quantity.doubleValue(for: HKUnit(from: "count/min")) ?? 0
            
            DispatchQueue.main.async {
                self?.averageHeartRate = Int(latestHeartRate)
            }
        }
        
        healthStore.execute(query)
        return query
    }
    
    func stopHeartRateQuery(_ query: HKAnchoredObjectQuery) {
        healthStore.stop(query)
    }
    
    func getHeartRateZones() -> [HeartRateZone] {
        // Simplified heart rate zones based on age
        // In a real app, you'd calculate these based on user's age and fitness level
        return [
            HeartRateZone(name: "Recovery", min: 50, max: 60, color: .blue),
            HeartRateZone(name: "Fat Burn", min: 60, max: 70, color: .green),
            HeartRateZone(name: "Aerobic", min: 70, max: 80, color: .yellow),
            HeartRateZone(name: "Anaerobic", min: 80, max: 90, color: .orange),
            HeartRateZone(name: "VO2 Max", min: 90, max: 100, color: .red)
        ]
    }
}

// MARK: - Heart Rate Zone Model
struct HeartRateZone {
    let name: String
    let min: Int
    let max: Int
    let color: Color
    
    enum Color {
        case blue, green, yellow, orange, red
        
        var systemColor: SwiftUI.Color {
            switch self {
            case .blue: return .blue
            case .green: return .green
            case .yellow: return .yellow
            case .orange: return .orange
            case .red: return .red
            }
        }
    }
}
