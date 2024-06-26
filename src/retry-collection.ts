import {
  AggregateOptions, Db, Document, Filter, FindOptions, InsertOneOptions, InsertOneResult,
  OptionalUnlessRequiredId, ReplaceOptions, UpdateFilter, UpdateOptions, UpdateResult, WithId, WithoutId
} from 'mongodb';

import { retryWrapper } from './retry-wrapper';

/**
 * Proxy collection with retry logic
 */
export class RetryCollection {

  constructor(
    private readonly db: Db,
    private readonly collectionName: string
  ) { }

  public count = async (): Promise<number> => this.db.collection(this.collectionName).countDocuments();

  public async findOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>
  ): Promise<TSchema | null> {
    return retryWrapper(
      async (): Promise<TSchema | null> => this.db.collection<TSchema>(this.collectionName).findOne(filter, options)
    );
  }

  public async findToArray<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>
  ): Promise<WithId<TSchema>[]> {
    return retryWrapper(
      async (): Promise<WithId<TSchema>[]> => this.db.collection<TSchema>(this.collectionName).find(filter, options).toArray()
    );
  }

  public async insertOne<TSchema extends Document = Document>(
    doc: OptionalUnlessRequiredId<TSchema>,
    options: InsertOneOptions
  ): Promise<InsertOneResult<TSchema>> {
    return retryWrapper(
      async (): Promise<InsertOneResult<TSchema>> => this.db.collection<TSchema>(this.collectionName).insertOne(doc, options)
    );
  }

  public async replaceOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    replacement: WithoutId<TSchema>,
    options: ReplaceOptions
  ): Promise<UpdateResult<TSchema> | Document> {
    return retryWrapper(
      async (): Promise<UpdateResult<TSchema> | Document> => this.db
        .collection<TSchema>(this.collectionName)
        .replaceOne(filter, replacement, options)
    );
  }

  public async updateOne<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    update: UpdateFilter<TSchema> | Partial<TSchema>,
    options: UpdateOptions
  ): Promise<UpdateResult> {
    return retryWrapper(
      async (): Promise<UpdateResult> => this.db
        .collection<TSchema>(this.collectionName)
        .updateOne(filter, update, options)
    );
  }

  public async updateMany<TSchema extends Document = Document>(
    filter: Filter<TSchema>,
    update: UpdateFilter<TSchema>,
    options: UpdateOptions
  ): Promise<UpdateResult | Document> {
    return retryWrapper(
      async (): Promise<UpdateResult | Document> => this.db
        .collection<TSchema>(this.collectionName)
        .updateMany(filter, update, options)
    );
  }

  public async aggregateToArray<TSchema extends Document = Document>(
    pipeline?: Document[],
    options?: AggregateOptions
  ): Promise<TSchema[]> {
    return retryWrapper(
      async (): Promise<TSchema[]> => this.db
        .collection<TSchema>(this.collectionName)
        .aggregate<TSchema>(pipeline, options)
        .toArray()
    );
  }

  public async aggregateNext<TSchema extends Document = Document>(
    pipeline?: Document[],
    options?: AggregateOptions
  ): Promise<TSchema | null> {
    return retryWrapper(
      async (): Promise<TSchema | null> => this.db
        .collection<TSchema>(this.collectionName)
        .aggregate<TSchema>(pipeline, options)
        .next()
    );
  }
}
