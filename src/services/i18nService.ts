import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface LocalizedContent {
  language: string;
  translations: Translation;
  lastUpdated: string;
}

class I18nService {
  private static instance: I18nService;
  private currentLanguage: string = 'en';
  private translations: Translation = {};
  private isRTL: boolean = false;
  private supportedLanguages: Language[] = [];

  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  constructor() {
    this.initializeSupportedLanguages();
    this.loadLanguageSettings();
  }

  private initializeSupportedLanguages() {
    this.supportedLanguages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        rtl: false,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        numberFormat: 'en-US',
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        rtl: false,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'es-ES',
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        rtl: false,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'fr-FR',
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: 'de-DE',
      },
      {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        rtl: false,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'it-IT',
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        rtl: false,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'pt-PT',
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: 'ru-RU',
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        rtl: false,
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        numberFormat: 'ja-JP',
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        rtl: false,
        dateFormat: 'YYYY.MM.DD',
        timeFormat: '24h',
        numberFormat: 'ko-KR',
      },
      {
        code: 'zh',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        rtl: false,
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h',
        numberFormat: 'zh-CN',
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        rtl: true,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'ar-SA',
      },
      {
        code: 'he',
        name: 'Hebrew',
        nativeName: 'עברית',
        rtl: true,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'he-IL',
      },
    ];
  }

  private async loadLanguageSettings() {
    try {
      const savedLanguage = await AsyncStorage.getItem('selected_language');
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
        await this.loadTranslations(savedLanguage);
      } else {
        // Default to English
        await this.loadTranslations('en');
      }
    } catch (error) {
      console.error('Failed to load language settings:', error);
    }
  }

  private async loadTranslations(languageCode: string) {
    try {
      // In a real app, you'd load from a translation service or local files
      this.translations = this.getDefaultTranslations(languageCode);
      
      const language = this.supportedLanguages.find(lang => lang.code === languageCode);
      if (language) {
        this.isRTL = language.rtl;
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  private getDefaultTranslations(languageCode: string): Translation {
    const translations: { [key: string]: Translation } = {
      en: {
        common: {
          start: 'Start',
          stop: 'Stop',
          pause: 'Pause',
          resume: 'Resume',
          complete: 'Complete',
          skip: 'Skip',
          next: 'Next',
          previous: 'Previous',
          save: 'Save',
          cancel: 'Cancel',
          done: 'Done',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
        },
        workout: {
          title: 'Workout',
          startWorkout: 'Start Workout',
          pauseWorkout: 'Pause Workout',
          endWorkout: 'End Workout',
          completeSet: 'Complete Set',
          restTime: 'Rest Time',
          nextExercise: 'Next Exercise',
          workoutComplete: 'Workout Complete',
          sets: 'Sets',
          reps: 'Reps',
          duration: 'Duration',
          calories: 'Calories',
          heartRate: 'Heart Rate',
        },
        exercises: {
          pushUps: 'Push-ups',
          pullUps: 'Pull-ups',
          squats: 'Squats',
          lunges: 'Lunges',
          planks: 'Planks',
          burpees: 'Burpees',
          jumpingJacks: 'Jumping Jacks',
          mountainClimbers: 'Mountain Climbers',
        },
        progress: {
          title: 'Progress',
          weight: 'Weight',
          strength: 'Strength',
          endurance: 'Endurance',
          weeklyProgress: 'Weekly Progress',
          monthlyProgress: 'Monthly Progress',
          achievements: 'Achievements',
        },
        settings: {
          title: 'Settings',
          language: 'Language',
          notifications: 'Notifications',
          privacy: 'Privacy',
          about: 'About',
        },
      },
      es: {
        common: {
          start: 'Comenzar',
          stop: 'Detener',
          pause: 'Pausar',
          resume: 'Reanudar',
          complete: 'Completar',
          skip: 'Omitir',
          next: 'Siguiente',
          previous: 'Anterior',
          save: 'Guardar',
          cancel: 'Cancelar',
          done: 'Hecho',
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
        },
        workout: {
          title: 'Entrenamiento',
          startWorkout: 'Comenzar Entrenamiento',
          pauseWorkout: 'Pausar Entrenamiento',
          endWorkout: 'Terminar Entrenamiento',
          completeSet: 'Completar Serie',
          restTime: 'Tiempo de Descanso',
          nextExercise: 'Siguiente Ejercicio',
          workoutComplete: 'Entrenamiento Completo',
          sets: 'Series',
          reps: 'Repeticiones',
          duration: 'Duración',
          calories: 'Calorías',
          heartRate: 'Frecuencia Cardíaca',
        },
        exercises: {
          pushUps: 'Flexiones',
          pullUps: 'Dominadas',
          squats: 'Sentadillas',
          lunges: 'Zancadas',
          planks: 'Planchas',
          burpees: 'Burpees',
          jumpingJacks: 'Saltos de Tijera',
          mountainClimbers: 'Escaladores',
        },
        progress: {
          title: 'Progreso',
          weight: 'Peso',
          strength: 'Fuerza',
          endurance: 'Resistencia',
          weeklyProgress: 'Progreso Semanal',
          monthlyProgress: 'Progreso Mensual',
          achievements: 'Logros',
        },
        settings: {
          title: 'Configuración',
          language: 'Idioma',
          notifications: 'Notificaciones',
          privacy: 'Privacidad',
          about: 'Acerca de',
        },
      },
      // Add more languages as needed...
    };

    return translations[languageCode] || translations.en;
  }

  // MARK: - Translation Methods
  t(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string') {
      // Replace parameters in translation
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
          return params[param]?.toString() || match;
        });
      }
      return value;
    }

    return key;
  }

  // MARK: - Language Management
  async setLanguage(languageCode: string): Promise<void> {
    try {
      this.currentLanguage = languageCode;
      await AsyncStorage.setItem('selected_language', languageCode);
      await this.loadTranslations(languageCode);
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): Language[] {
    return [...this.supportedLanguages];
  }

  getCurrentLanguageInfo(): Language | undefined {
    return this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
  }

  isRTL(): boolean {
    return this.isRTL;
  }

  // MARK: - Date and Time Formatting
  formatDate(date: Date): string {
    const language = this.getCurrentLanguageInfo();
    if (!language) return date.toLocaleDateString();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return date.toLocaleDateString(language.numberFormat, options);
  }

  formatTime(date: Date): string {
    const language = this.getCurrentLanguageInfo();
    if (!language) return date.toLocaleTimeString();

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: language.timeFormat === '12h',
    };

    return date.toLocaleTimeString(language.numberFormat, options);
  }

  formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  // MARK: - Number Formatting
  formatNumber(number: number): string {
    const language = this.getCurrentLanguageInfo();
    if (!language) return number.toString();

    return new Intl.NumberFormat(language.numberFormat).format(number);
  }

  formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
    const formattedNumber = this.formatNumber(weight);
    return `${formattedNumber} ${unit}`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // MARK: - Workout-Specific Translations
  getExerciseName(exerciseKey: string): string {
    return this.t(`exercises.${exerciseKey}`);
  }

  getMuscleGroupName(muscleGroup: string): string {
    return this.t(`muscleGroups.${muscleGroup}`);
  }

  getEquipmentName(equipment: string): string {
    return this.t(`equipment.${equipment}`);
  }

  getDifficultyLevel(difficulty: string): string {
    return this.t(`difficulty.${difficulty}`);
  }

  // MARK: - Cultural Adaptations
  getWorkoutPreferences(): {
    preferredUnits: 'metric' | 'imperial';
    preferredTimeFormat: '12h' | '24h';
    preferredDateFormat: string;
  } {
    const language = this.getCurrentLanguageInfo();
    if (!language) {
      return {
        preferredUnits: 'metric',
        preferredTimeFormat: '12h',
        preferredDateFormat: 'MM/DD/YYYY',
      };
    }

    // Cultural preferences based on language/region
    const imperialUnits = ['en-US', 'en-GB']; // English-speaking countries
    const metricUnits = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'he'];

    return {
      preferredUnits: imperialUnits.includes(language.numberFormat) ? 'imperial' : 'metric',
      preferredTimeFormat: language.timeFormat as '12h' | '24h',
      preferredDateFormat: language.dateFormat,
    };
  }

  // MARK: - RTL Support
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL ? 'rtl' : 'ltr';
  }

  getTextAlignment(): 'left' | 'right' {
    return this.isRTL ? 'right' : 'left';
  }

  // MARK: - Localized Content
  getLocalizedWorkoutPlan(plan: any): any {
    return {
      ...plan,
      name: this.t(`workoutPlans.${plan.id}.name`) || plan.name,
      description: this.t(`workoutPlans.${plan.id}.description`) || plan.description,
      exercises: plan.exercises.map((exercise: any) => ({
        ...exercise,
        name: this.getExerciseName(exercise.key) || exercise.name,
        instructions: exercise.instructions.map((instruction: string) => 
          this.t(`instructions.${instruction}`) || instruction
        ),
      })),
    };
  }

  // MARK: - Error Messages
  getErrorMessage(errorCode: string): string {
    return this.t(`errors.${errorCode}`) || this.t('common.error');
  }

  getSuccessMessage(successCode: string): string {
    return this.t(`success.${successCode}`) || this.t('common.success');
  }

  // MARK: - Validation Messages
  getValidationMessage(field: string, rule: string): string {
    return this.t(`validation.${field}.${rule}`) || `${field} is invalid`;
  }
}

export const i18nService = I18nService.getInstance();
