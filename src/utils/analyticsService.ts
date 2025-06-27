// Analytics Service for User Behavior Tracking
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface UserMetrics {
  documentsProcessed: number;
  averageProcessingTime: number;
  preferredLanguage: string;
  successRate: number;
  lastActivity: number;
}

export interface SystemMetrics {
  totalUsers: number;
  totalDocuments: number;
  averageSuccessRate: number;
  popularLanguages: Record<string, number>;
  popularDocumentTypes: Record<string, number>;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId: string | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    this.persistEvents();

    // In production, send to analytics service
    this.sendToAnalyticsService(analyticsEvent);
  }

  public trackDocumentUpload(documentType: string, language: string, fileSize: number): void {
    this.trackEvent('document_upload', {
      documentType,
      language,
      fileSize,
      category: 'document_processing'
    });
  }

  public trackDocumentProcessing(
    documentId: string,
    processingTime: number,
    success: boolean,
    errorType?: string
  ): void {
    this.trackEvent('document_processing', {
      documentId,
      processingTime,
      success,
      errorType,
      category: 'document_processing'
    });
  }

  public trackGuideGeneration(
    documentId: string,
    language: string,
    jurisdiction: string,
    stepCount: number
  ): void {
    this.trackEvent('guide_generation', {
      documentId,
      language,
      jurisdiction,
      stepCount,
      category: 'ai_features'
    });
  }

  public trackVoicePlayback(textLength: number, language: string, success: boolean): void {
    this.trackEvent('voice_playback', {
      textLength,
      language,
      success,
      category: 'accessibility'
    });
  }

  public trackUserEngagement(action: string, elementId?: string, duration?: number): void {
    this.trackEvent('user_engagement', {
      action,
      elementId,
      duration,
      category: 'user_behavior'
    });
  }

  public async getUserMetrics(userId: string): Promise<UserMetrics> {
    const userEvents = this.events.filter(e => e.userId === userId);
    
    const documentEvents = userEvents.filter(e => e.event === 'document_processing');
    const successfulProcessing = documentEvents.filter(e => e.properties.success);
    
    const processingTimes = documentEvents
      .map(e => e.properties.processingTime)
      .filter(t => typeof t === 'number');

    const languageEvents = userEvents.filter(e => e.properties.language);
    const languages = languageEvents.map(e => e.properties.language);
    const preferredLanguage = this.getMostFrequent(languages) || 'en';

    return {
      documentsProcessed: documentEvents.length,
      averageProcessingTime: processingTimes.length > 0 
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
        : 0,
      preferredLanguage,
      successRate: documentEvents.length > 0 
        ? (successfulProcessing.length / documentEvents.length) * 100 
        : 0,
      lastActivity: Math.max(...userEvents.map(e => e.timestamp), 0)
    };
  }

  public getSystemMetrics(): SystemMetrics {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean)).size;
    const documentEvents = this.events.filter(e => e.event === 'document_processing');
    const successfulEvents = documentEvents.filter(e => e.properties.success);

    const languages = this.events
      .filter(e => e.properties.language)
      .map(e => e.properties.language);

    const documentTypes = this.events
      .filter(e => e.properties.documentType)
      .map(e => e.properties.documentType);

    return {
      totalUsers: uniqueUsers,
      totalDocuments: documentEvents.length,
      averageSuccessRate: documentEvents.length > 0 
        ? (successfulEvents.length / documentEvents.length) * 100 
        : 0,
      popularLanguages: this.getFrequencyMap(languages),
      popularDocumentTypes: this.getFrequencyMap(documentTypes)
    };
  }

  public exportAnalytics(): {
    events: AnalyticsEvent[];
    summary: SystemMetrics;
    exportDate: string;
  } {
    return {
      events: this.events,
      summary: this.getSystemMetrics(),
      exportDate: new Date().toISOString()
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('justguide_analytics');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load stored analytics:', error);
    }
  }

  private persistEvents(): void {
    try {
      // Keep only last 1000 events to prevent storage bloat
      const eventsToStore = this.events.slice(-1000);
      localStorage.setItem('justguide_analytics', JSON.stringify(eventsToStore));
    } catch (error) {
      console.error('Failed to persist analytics:', error);
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, send to your analytics service
      // For demo, just log to console
      console.log('Analytics Event:', event);
      
      // Example: Send to Google Analytics, Mixpanel, etc.
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private getMostFrequent<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    
    const frequency = this.getFrequencyMap(array);
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    ) as T;
  }

  private getFrequencyMap<T extends string | number>(array: T[]): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = String(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}