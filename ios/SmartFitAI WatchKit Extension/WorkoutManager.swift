import Foundation
import HealthKit
import WatchKit

class WorkoutManager: NSObject, ObservableObject {
    @Published var isWorkoutActive = false
    @Published var currentWorkout: Workout?
    @Published var currentExercise: Exercise?
    @Published var currentSet: Int = 1
    @Published var totalSets: Int = 0
    @Published var isResting = false
    @Published var restTimeRemaining: TimeInterval = 0
    @Published var workoutStartTime: Date?
    @Published var workoutDuration: TimeInterval = 0
    
    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?
    private var restTimer: Timer?
    
    // Mock data for demonstration
    let availableWorkouts = [
        Workout(
            id: "1",
            name: "Upper Body",
            duration: 45,
            exercises: [
                Exercise(id: "1", name: "Push-ups", sets: 3, reps: "10-15", restTime: 60),
                Exercise(id: "2", name: "Pull-ups", sets: 3, reps: "5-10", restTime: 90),
                Exercise(id: "3", name: "Dips", sets: 3, reps: "8-12", restTime: 60)
            ]
        ),
        Workout(
            id: "2",
            name: "Lower Body",
            duration: 40,
            exercises: [
                Exercise(id: "4", name: "Squats", sets: 4, reps: "12-15", restTime: 60),
                Exercise(id: "5", name: "Lunges", sets: 3, reps: "10 each", restTime: 45),
                Exercise(id: "6", name: "Calf Raises", sets: 3, reps: "15-20", restTime: 30)
            ]
        ),
        Workout(
            id: "3",
            name: "Core",
            duration: 30,
            exercises: [
                Exercise(id: "7", name: "Plank", sets: 3, reps: "30-60s", restTime: 60),
                Exercise(id: "8", name: "Crunches", sets: 3, reps: "15-25", restTime: 45),
                Exercise(id: "9", name: "Mountain Climbers", sets: 3, reps: "20-30", restTime: 60)
            ]
        )
    ]
    
    override init() {
        super.init()
        requestHealthKitPermissions()
    }
    
    func requestHealthKitPermissions() {
        let typesToShare: Set = [
            HKQuantityType.workoutType()
        ]
        
        let typesToRead: Set = [
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!
        ]
        
        healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead) { success, error in
            if let error = error {
                print("HealthKit authorization failed: \(error.localizedDescription)")
            }
        }
    }
    
    func startWorkout(workout: Workout? = nil) {
        guard !isWorkoutActive else { return }
        
        let selectedWorkout = workout ?? availableWorkouts.first!
        currentWorkout = selectedWorkout
        currentExercise = selectedWorkout.exercises.first
        currentSet = 1
        totalSets = selectedWorkout.exercises.reduce(0) { $0 + $1.sets }
        workoutStartTime = Date()
        isWorkoutActive = true
        
        startHealthKitWorkout()
        WKInterfaceDevice.current().play(.start)
    }
    
    func pauseWorkout() {
        guard isWorkoutActive else { return }
        
        workoutSession?.pause()
        WKInterfaceDevice.current().play(.click)
    }
    
    func resumeWorkout() {
        guard isWorkoutActive else { return }
        
        workoutSession?.resume()
        WKInterfaceDevice.current().play(.click)
    }
    
    func endWorkout() {
        guard isWorkoutActive else { return }
        
        isWorkoutActive = false
        isResting = false
        restTimer?.invalidate()
        restTimer = nil
        
        workoutSession?.end()
        workoutBuilder?.endCollection(withEnd: Date()) { success, error in
            if success {
                self.workoutBuilder?.finishWorkout { workout, error in
                    if let error = error {
                        print("Error finishing workout: \(error.localizedDescription)")
                    }
                }
            }
        }
        
        WKInterfaceDevice.current().play(.stop)
    }
    
    func completeSet() {
        guard let exercise = currentExercise else { return }
        
        WKInterfaceDevice.current().play(.success)
        
        if currentSet < exercise.sets {
            currentSet += 1
            startRestTimer(duration: exercise.restTime)
        } else {
            completeExercise()
        }
    }
    
    private func completeExercise() {
        guard let workout = currentWorkout,
              let currentIndex = workout.exercises.firstIndex(where: { $0.id == currentExercise?.id }) else { return }
        
        let nextIndex = currentIndex + 1
        if nextIndex < workout.exercises.count {
            currentExercise = workout.exercises[nextIndex]
            currentSet = 1
            startRestTimer(duration: 60) // 1 minute between exercises
        } else {
            // Workout complete
            endWorkout()
        }
    }
    
    private func startRestTimer(duration: TimeInterval) {
        isResting = true
        restTimeRemaining = duration
        
        restTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if self.restTimeRemaining > 0 {
                self.restTimeRemaining -= 1
                
                // Haptic feedback at key intervals
                if self.restTimeRemaining == 10 || self.restTimeRemaining == 5 || self.restTimeRemaining == 3 {
                    WKInterfaceDevice.current().play(.click)
                }
            } else {
                self.isResting = false
                self.restTimer?.invalidate()
                self.restTimer = nil
                WKInterfaceDevice.current().play(.success)
            }
        }
    }
    
    private func startHealthKitWorkout() {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .traditionalStrengthTraining
        configuration.locationType = .indoor
        
        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()
            
            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore, workoutConfiguration: configuration)
            
            workoutSession?.delegate = self
            workoutBuilder?.delegate = self
            
            workoutSession?.startActivity(with: Date())
            workoutBuilder?.beginCollection(at: Date()) { success, error in
                if let error = error {
                    print("Error beginning workout collection: \(error.localizedDescription)")
                }
            }
        } catch {
            print("Error creating workout session: \(error.localizedDescription)")
        }
    }
    
    var formattedDuration: String {
        guard let startTime = workoutStartTime else { return "0:00" }
        let duration = Date().timeIntervalSince(startTime)
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - HKWorkoutSessionDelegate
extension WorkoutManager: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        DispatchQueue.main.async {
            switch toState {
            case .running:
                self.isWorkoutActive = true
            case .paused:
                self.isWorkoutActive = false
            case .ended:
                self.isWorkoutActive = false
            default:
                break
            }
        }
    }
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("Workout session failed: \(error.localizedDescription)")
    }
}

// MARK: - HKLiveWorkoutBuilderDelegate
extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        // Handle real-time workout data
    }
    
    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
        // Handle workout events
    }
}

// MARK: - Data Models
struct Workout: Identifiable {
    let id: String
    let name: String
    let duration: Int
    let exercises: [Exercise]
}

struct Exercise: Identifiable {
    let id: String
    let name: String
    let sets: Int
    let reps: String
    let restTime: TimeInterval
}
