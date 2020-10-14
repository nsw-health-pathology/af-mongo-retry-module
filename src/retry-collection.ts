import {
  AggregationCursor, CollectionAggregationOptions, CollectionInsertOneOptions,
  Db, FilterQuery, FindOneOptions, InsertOneWriteOpResult, MongoCallback, OptionalId,
  ReplaceOneOptions, ReplaceWriteOpResult, UpdateOneOptions, UpdateQuery, UpdateWriteOpResult,
  WithId
} from 'mongodb';

import { RetryWrapper } from './retry-wrapper';

/**
 * Proxy collection with retry logic
 */
export class RetryCollection {

  constructor(
    private readonly db: Db,
    private readonly collectionName: string
  ) { }

  public count = async (): Promise<number> => this.db.collection(this.collectionName).count();

  // tslint:disable: completed-docs
  // tslint:disable: no-any
  // tslint:disable: no-unsafe-any

  public async findOne<T = any>(filter: FilterQuery<any>, options?: FindOneOptions<any>): Promise<any> {
    return RetryWrapper(
      async (): Promise<T> => this.db.collection<T>(this.collectionName).findOne(filter, options)
    );
  }

  public async findToArray<T = any>(query: FilterQuery<any>, options?: FindOneOptions<any>): Promise<T[]> {
    return RetryWrapper(
      async (): Promise<any[]> => this.db.collection<T>(this.collectionName).find(query, options).toArray()
    );
  }

  public async insertOne<T = any>(docs: OptionalId<T>, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<WithId<T>>> {
    return RetryWrapper(
      async (): Promise<InsertOneWriteOpResult<WithId<T>>> => this.db.collection<T>(this.collectionName).insertOne(docs, options)
    );
  }

  public async replaceOne<T = any>(filter: FilterQuery<any>, doc: any, options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult> {
    return RetryWrapper(
      async (): Promise<ReplaceWriteOpResult> => this.db.collection<T>(this.collectionName).replaceOne(filter, doc, options)
    );
  }

  public async updateOne<T = any>(
    filter: FilterQuery<any>,
    update: UpdateQuery<any> | Partial<any>,
    options?: UpdateOneOptions
  ): Promise<UpdateWriteOpResult> {
    return RetryWrapper(
      async (): Promise<UpdateWriteOpResult> => this.db.collection<T>(this.collectionName).updateOne(filter, update, options)
    );
  }

  public async updateMany<T = any>(
    filter: FilterQuery<any>,
    update: UpdateQuery<any> | Partial<any>,
    options?: UpdateOneOptions
  ): Promise<UpdateWriteOpResult> {
    return RetryWrapper(
      async (): Promise<UpdateWriteOpResult> => this.db.collection<T>(this.collectionName).updateMany(filter, update, options)
    );
  }

  public async aggregateToArray<T = any>(
    pipeline?: object[],
    options?: CollectionAggregationOptions,
    callback?: MongoCallback<AggregationCursor<any>>
  ): Promise<T[]> {
    return RetryWrapper(
      async (): Promise<T[]> => this.db.collection<T>(this.collectionName).aggregate<T>(pipeline, options, callback).toArray()
    );
  }

  public async aggregateNext<T = any>(
    pipeline?: object[],
    options?: CollectionAggregationOptions,
    callback?: MongoCallback<AggregationCursor<any>>
  ): Promise<T | null> {
    return RetryWrapper(
      async (): Promise<T | null> => this.db.collection<T>(this.collectionName).aggregate<T>(pipeline, options, callback).next()
    );
  }
}
