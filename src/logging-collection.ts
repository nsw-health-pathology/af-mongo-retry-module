
import { AppInsightsService, Timer } from '@nswhp/af-app-insights';
import {
  AggregationCursor,
  CollectionAggregationOptions,
  CollectionInsertOneOptions,
  FilterQuery,
  FindOneOptions,
  InsertOneWriteOpResult,
  MongoCallback,
  ReplaceOneOptions,
  ReplaceWriteOpResult,
  UpdateOneOptions,
  UpdateQuery,
  UpdateWriteOpResult,
  WithId
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

  // tslint:disable: completed-docs
  // tslint:disable: no-any

  public async findOne<T = any>(filter: FilterQuery<any>, options: FindOneOptions<any>): Promise<T> {
    const mongoRequest = JSON.stringify({ find: { filter, options } });
    return this.trackDependency(() => this.retryCollection.findOne(filter, options), mongoRequest);
  }

  public async findToArray<T = any>(query: FilterQuery<any>, options: FindOneOptions<any>): Promise<T[]> {
    const mongoRequest = JSON.stringify({ find: { query, options } });
    return this.trackDependency(() => this.retryCollection.findToArray(query, options), mongoRequest);
  }

  public async insertOne<T = any>(docs: any, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<WithId<T>>> {
    const mongoRequest = JSON.stringify({ insertOne: { options } });
    return this.trackDependency(() => this.retryCollection.insertOne(docs, options), mongoRequest);
  }

  public async replaceOne<T = any>(
    filter: FilterQuery<any>,
    doc: T,
    options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult> {
    const mongoRequest = JSON.stringify({ replaceOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.replaceOne(filter, doc, options), mongoRequest);
  }

  public async updateOne<T = any>(
    filter: FilterQuery<any>,
    update: UpdateQuery<any> | Partial<any>,
    options?: UpdateOneOptions
  ): Promise<UpdateWriteOpResult> {
    const mongoRequest = JSON.stringify({ updateOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.updateOne(filter, update, options), mongoRequest);
  }

  public async updateMany<T = any>(
    filter: FilterQuery<any>,
    update: UpdateQuery<any> | Partial<any>,
    options?: UpdateOneOptions
  ): Promise<UpdateWriteOpResult> {
    const mongoRequest = JSON.stringify({ updateOne: { filter, options } });
    return this.trackDependency(() => this.retryCollection.updateMany(filter, update, options), mongoRequest);
  }

  public async aggregateToArray<T = any>(
    pipeline?: object[],
    options?: CollectionAggregationOptions,
    callback?: MongoCallback<AggregationCursor<any>>
  ): Promise<any[]> {
    const mongoRequest = JSON.stringify({ aggregate: { pipeline, options } });
    return this.trackDependency(() => this.retryCollection.aggregateToArray(pipeline, options, callback), mongoRequest);
  }

  public async aggregateNext<T = any>(
    pipeline?: object[],
    options?: CollectionAggregationOptions,
    callback?: MongoCallback<AggregationCursor<any>>
  ): Promise<any> {
    const mongoRequest = JSON.stringify({ aggregateNext: { pipeline, options } });
    return this.trackDependency(() => this.retryCollection.aggregateNext(pipeline, options, callback), mongoRequest);
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
