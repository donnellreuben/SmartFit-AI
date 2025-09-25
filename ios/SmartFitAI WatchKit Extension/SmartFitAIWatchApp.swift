import SwiftUI
import WatchKit
import HealthKit

@main
struct SmartFitAIWatchApp: App {
    @StateObject private var workoutManager = WorkoutManager()
    @StateObject private var healthManager = HealthManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(workoutManager)
                .environmentObject(healthManager)
                .onAppear {
                    healthManager.requestHealthKitPermissions()
                }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    @EnvironmentObject var healthManager: HealthManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            // Workout Tab
            WorkoutListView()
                .tabItem {
                    Image(systemName: "figure.strengthtraining.traditional")
                    Text("Workouts")
                }
                .tag(1)
            
            // Progress Tab
            ProgressView()
                .tabItem {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                    Text("Progress")
                }
                .tag(2)
            
            // Settings Tab
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Quick Start Workout
                if !workoutManager.isWorkoutActive {
                    QuickStartCard()
                } else {
                    ActiveWorkoutCard()
                }
                
                // Today's Stats
                TodayStatsCard()
                
                // Recent Workouts
                RecentWorkoutsCard()
            }
            .padding()
        }
        .navigationTitle("SmartFit AI")
    }
}

// MARK: - Quick Start Card
struct QuickStartCard: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "play.circle.fill")
                .font(.system(size: 32))
                .foregroundColor(.blue)
            
            Text("Start Workout")
                .font(.headline)
                .foregroundColor(.primary)
            
            Text("Tap to begin your workout")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onTapGesture {
            workoutManager.startWorkout()
        }
    }
}

// MARK: - Active Workout Card
struct ActiveWorkoutCard: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "figure.strengthtraining.traditional")
                    .foregroundColor(.green)
                
                Text("Workout Active")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text(workoutManager.formattedDuration)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(workoutManager.currentExercise ?? "Rest")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Button("Pause") {
                    workoutManager.pauseWorkout()
                }
                .buttonStyle(.bordered)
                
                Button("End") {
                    workoutManager.endWorkout()
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Today's Stats Card
struct TodayStatsCard: View {
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Today's Stats")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack {
                StatItem(
                    icon: "flame.fill",
                    value: "\(healthManager.caloriesBurned)",
                    label: "Calories"
                )
                
                StatItem(
                    icon: "heart.fill",
                    value: "\(healthManager.averageHeartRate)",
                    label: "BPM"
                )
                
                StatItem(
                    icon: "clock.fill",
                    value: "\(healthManager.workoutMinutes)",
                    label: "Minutes"
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .font(.system(size: 16))
            
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
            
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Recent Workouts Card
struct RecentWorkoutsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Recent Workouts")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 4) {
                RecentWorkoutRow(
                    name: "Upper Body",
                    duration: "45 min",
                    date: "Today"
                )
                
                RecentWorkoutRow(
                    name: "Cardio",
                    duration: "30 min",
                    date: "Yesterday"
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct RecentWorkoutRow: View {
    let name: String
    let duration: String
    let date: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.caption)
                    .fontWeight(.medium)
                
                Text(duration)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(date)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Workout List View
struct WorkoutListView: View {
    @EnvironmentObject var workoutManager: WorkoutManager
    
    var body: some View {
        NavigationView {
            List {
                ForEach(workoutManager.availableWorkouts, id: \.id) { workout in
                    WorkoutRow(workout: workout)
                        .onTapGesture {
                            workoutManager.startWorkout(workout: workout)
                        }
                }
            }
            .navigationTitle("Workouts")
        }
    }
}

struct WorkoutRow: View {
    let workout: Workout
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(workout.name)
                .font(.headline)
                .foregroundColor(.primary)
            
            Text("\(workout.duration) min • \(workout.exercises.count) exercises")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Progress View
struct ProgressView: View {
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Weekly Summary
                WeeklySummaryCard()
                
                // Heart Rate Chart
                HeartRateChart()
                
                // Achievements
                AchievementsCard()
            }
            .padding()
        }
        .navigationTitle("Progress")
    }
}

struct WeeklySummaryCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("This Week")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack {
                WeeklyStatItem(
                    value: "5",
                    label: "Workouts"
                )
                
                WeeklyStatItem(
                    value: "240",
                    label: "Minutes"
                )
                
                WeeklyStatItem(
                    value: "1,200",
                    label: "Calories"
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct WeeklyStatItem: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct HeartRateChart: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Heart Rate Zones")
                .font(.headline)
                .foregroundColor(.primary)
            
            // Simplified heart rate visualization
            HStack(spacing: 4) {
                ForEach(0..<7) { _ in
                    Rectangle()
                        .fill(Color.blue.opacity(0.3))
                        .frame(height: 20)
                }
            }
            .cornerRadius(4)
            
            Text("Average: 145 BPM")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct AchievementsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Recent Achievements")
                .font(.headline)
                .foregroundColor(.primary)
            
            VStack(spacing: 4) {
                AchievementRow(
                    icon: "flame.fill",
                    title: "7-Day Streak",
                    date: "Today"
                )
                
                AchievementRow(
                    icon: "heart.fill",
                    title: "Heart Rate Goal",
                    date: "Yesterday"
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct AchievementRow: View {
    let icon: String
    let title: String
    let date: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.orange)
                .font(.system(size: 16))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                
                Text(date)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @EnvironmentObject var healthManager: HealthManager
    
    var body: some View {
        List {
            Section("Health") {
                HStack {
                    Text("Heart Rate Monitoring")
                    Spacer()
                    Toggle("", isOn: .constant(true))
                }
                
                HStack {
                    Text("Workout Detection")
                    Spacer()
                    Toggle("", isOn: .constant(true))
                }
            }
            
            Section("Notifications") {
                HStack {
                    Text("Workout Reminders")
                    Spacer()
                    Toggle("", isOn: .constant(true))
                }
                
                HStack {
                    Text("Rest Timer Alerts")
                    Spacer()
                    Toggle("", isOn: .constant(true))
                }
            }
            
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("Settings")
    }
}

#Preview {
    ContentView()
        .environmentObject(WorkoutManager())
        .environmentObject(HealthManager())
}
