import SwiftUI
import HealthKit
import WatchKit

struct ActiveWorkoutView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    @EnvironmentObject var healthManager: HealthManager
    @State private var heartRateQuery: HKAnchoredObjectQuery?
    @State private var showRestTimer = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Workout Header
                WorkoutHeaderView()
                
                // Current Exercise
                if let exercise = workoutManager.currentExercise {
                    CurrentExerciseView(exercise: exercise)
                }
                
                // Set Progress
                SetProgressView()
                
                // Heart Rate (if available)
                if healthManager.isAuthorized {
                    HeartRateView()
                }
                
                // Rest Timer
                if workoutManager.isResting {
                    RestTimerView()
                }
                
                // Action Buttons
                ActionButtonsView()
            }
            .padding()
        }
        .navigationTitle("Workout")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if healthManager.isAuthorized {
                heartRateQuery = healthManager.startHeartRateQuery()
            }
        }
        .onDisappear {
            if let query = heartRateQuery {
                healthManager.stopHeartRateQuery(query)
            }
        }
    }
}

// MARK: - Workout Header
struct WorkoutHeaderView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(workoutManager.currentWorkout?.name ?? "Workout")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text(workoutManager.formattedDuration)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Progress Bar
            ProgressView(value: Double(workoutManager.currentSet), total: Double(workoutManager.totalSets))
                .progressViewStyle(LinearProgressViewStyle(tint: .blue))
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Current Exercise
struct CurrentExerciseView: View {
    let exercise: Exercise
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 12) {
            Text(exercise.name)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
                .multilineTextAlignment(.center)
            
            HStack(spacing: 20) {
                VStack {
                    Text("\(workoutManager.currentSet)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    Text("Set")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack {
                    Text(exercise.reps)
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    Text("Reps")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack {
                    Text("\(Int(exercise.restTime))")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.orange)
                    Text("Rest (s)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Set Progress
struct SetProgressView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 8) {
            Text("Set Progress")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack {
                ForEach(1...(workoutManager.currentExercise?.sets ?? 1), id: \.self) { setNumber in
                    Circle()
                        .fill(setNumber <= workoutManager.currentSet ? Color.blue : Color.gray.opacity(0.3))
                        .frame(width: 12, height: 12)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Heart Rate
struct HeartRateView: View {
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                
                Text("Heart Rate")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("\(healthManager.averageHeartRate) BPM")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.red)
            }
            
            // Heart Rate Zone Indicator
            HeartRateZoneIndicator()
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct HeartRateZoneIndicator: View {
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        let zones = healthManager.getHeartRateZones()
        let currentHR = healthManager.averageHeartRate
        
        HStack(spacing: 4) {
            ForEach(zones, id: \.name) { zone in
                Rectangle()
                    .fill(zone.color.systemColor.opacity(
                        currentHR >= zone.min && currentHR <= zone.max ? 1.0 : 0.3
                    ))
                    .frame(height: 8)
            }
        }
        .cornerRadius(4)
    }
}

// MARK: - Rest Timer
struct RestTimerView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Rest Time")
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(formatTime(workoutManager.restTimeRemaining))
                .font(.system(size: 48, weight: .bold, design: .monospaced))
                .foregroundColor(.orange)
            
            Text("Next: \(workoutManager.currentExercise?.name ?? "Exercise")")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func formatTime(_ timeInterval: TimeInterval) -> String {
        let minutes = Int(timeInterval) / 60
        let seconds = Int(timeInterval) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Action Buttons
struct ActionButtonsView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 12) {
            if workoutManager.isResting {
                // Rest Timer Actions
                HStack(spacing: 12) {
                    Button("Skip Rest") {
                        workoutManager.isResting = false
                        workoutManager.restTimer?.invalidate()
                        WKInterfaceDevice.current().play(.success)
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                    
                    Button("+30s") {
                        workoutManager.restTimeRemaining += 30
                        WKInterfaceDevice.current().play(.click)
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                }
            } else {
                // Workout Actions
                Button("Complete Set") {
                    workoutManager.completeSet()
                }
                .buttonStyle(.borderedProminent)
                .frame(maxWidth: .infinity)
            }
            
            // Control Buttons
            HStack(spacing: 12) {
                if workoutManager.isWorkoutActive {
                    Button("Pause") {
                        workoutManager.pauseWorkout()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                } else {
                    Button("Resume") {
                        workoutManager.resumeWorkout()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                }
                
                Button("End") {
                    workoutManager.endWorkout()
                }
                .buttonStyle(.bordered)
                .foregroundColor(.red)
                .frame(maxWidth: .infinity)
            }
        }
    }
}

// MARK: - Workout Summary View
struct WorkoutSummaryView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    @EnvironmentObject var healthManager: HealthManager
    @Binding var isPresented: Bool
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Summary Header
                VStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.green)
                    
                    Text("Workout Complete!")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text(workoutManager.formattedDuration)
                        .font(.title3)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Stats
                VStack(spacing: 12) {
                    StatRow(
                        icon: "flame.fill",
                        title: "Calories Burned",
                        value: "\(healthManager.caloriesBurned)"
                    )
                    
                    StatRow(
                        icon: "heart.fill",
                        title: "Avg Heart Rate",
                        value: "\(healthManager.averageHeartRate) BPM"
                    )
                    
                    StatRow(
                        icon: "figure.strengthtraining.traditional",
                        title: "Sets Completed",
                        value: "\(workoutManager.totalSets)"
                    )
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Action Buttons
                VStack(spacing: 8) {
                    Button("Save Workout") {
                        // Save workout to HealthKit
                        if let workout = workoutManager.currentWorkout,
                           let startTime = workoutManager.workoutStartTime {
                            healthManager.saveWorkout(
                                workout: workout,
                                startDate: startTime,
                                endDate: Date()
                            )
                        }
                        isPresented = false
                    }
                    .buttonStyle(.borderedProminent)
                    .frame(maxWidth: .infinity)
                    
                    Button("Share") {
                        // Share workout achievement
                        isPresented = false
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                }
            }
            .padding()
        }
        .navigationTitle("Summary")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct StatRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            Text(title)
                .font(.body)
                .foregroundColor(.primary)
            
            Spacer()
            
            Text(value)
                .font(.body)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
        }
    }
}

#Preview {
    ActiveWorkoutView()
        .environmentObject(WorkoutManager())
        .environmentObject(HealthManager())
}
