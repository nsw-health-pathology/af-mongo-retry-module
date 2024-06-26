
import { AppInsightsService, Timer } from '@nswhp/af-app-insights';
import {
  AggregateOptions, Document, Filter, FindOptions, InsertOneOptions, InsertOneResult,
  OptionalUnlessRequiredId, ReplaceOptions, UpdateFilter, UpdateOptions, UpdateResult, WithId, WithoutId
} from 'mongodb';


import { IDependencyTelemetry } from './dependency-telemetry';
import { RetryCollection } from './retry-collection';

/**
 * Proxy collection with retry logic
 */
export class LoggingCollection {

  constructor(
    private readonly retryCollection: RetryCollection,
    private readonly collectionName: string,
    private readonly dbName: string,
    private readonly appInsights: AppInsightsService
  ) { }

  public count = async (): Promise<number> => this.retryCollection.count();

  public async findOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>
  ): Promise<TSchema | null> {
    const mongoRequest = JSON.stringify({ find: { filter, options } });
    return this.trackDependency(() => this.retryCollection.findOne(filter, options), mongoRequest);
  }

  public async findToArray<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>
  ): Promise<WithId<TSchema>[]> {
    const mongoRequest = JSON.stringify({ find: { filter, options } });
    return this.trackDependency(() => this.retryCollection.findToArray(filter, options), mongoRequest);
  }

  public async insertOne<TSchema extends Document = Document>(
    doc: OptionalUnlessRequiredId<TSchema>,
    options: InsertOneOptions
  ): Promise<InsertOneResult<TSchema>> {
    const mongoRequest = JSON.stringify({ insertOne: { options } });
    return this.trackDependency(() => this.retryCollection.insertOne(doc, options), mongoRequest);
  }

  public async replaceOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    replacement: WithoutId<TSchema>,
    options: ReplaceOptions
  ): Promise<UpdateResult<TSchema> | Document> {
    const mongoRequest = JSON.stringify({ replaceOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.replaceOne(filter, replacement, options), mongoRequest);
  }

  public async updateOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    update: UpdateFilter<TSchema> | Partial<TSchema>,
    options: UpdateOptions
  ): Promise<UpdateResult | Document> {
    const mongoRequest = JSON.stringify({ updateOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.updateOne(filter, update, options), mongoRequest);
  }

  public async updateMany<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    update: UpdateFilter<TSchema>,
    options: UpdateOptions
  ): Promise<UpdateResult | Document> {
    const mongoRequest = JSON.stringify({ updateOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.updateMany(filter, update, options), mongoRequest);
  }

  public async aggregateToArray<TSchema extends Document = Document>(
    pipeline?: Document[],
    options?: AggregateOptions
  ): Promise<TSchema[]> {
    const mongoRequest = JSON.stringify({ aggregate: { pipeline, options } });
    return this.trackDependency(() => this.retryCollection.aggregateToArray(pipeline, options), mongoRequest);
  }

  public async aggregateNext<TSchema extends Document = Document>(
    pipeline?: Document[],
    options?: AggregateOptions
  ): Promise<TSchema | null> {
    const mongoRequest = JSON.stringify({ aggregateNext: { pipeline, options } });
    return this.trackDependency(() => this.retryCollection.aggregateNext(pipeline, options), mongoRequest);
  }

  private async trackDependency<T>(fn: () => Promise<T>, query: string): Promise<T> {
    const timer = new Timer();

    try {
      const result = await fn();
      timer.stop();
      this.appInsights.client?.trackDependency(this.createDependency(query, timer, 0, true));
      return result;

    } catch (e) {
      timer.stop();
      this.appInsights.client?.trackDependency(this.createDependency(query, timer, JSON.stringify(e), false));
      throw e;
    }

  }

  private createDependency(query: string, timer: Timer, resultCode: number | string, success: boolean): IDependencyTelemetry {
    return {
      data: query,
      dependencyTypeName: 'mongodb',
      duration: timer.duration,
      time: timer.endDate,
      resultCode,
      success,
      name: this.dbName,
      target: this.collectionName
    };
  }
}
