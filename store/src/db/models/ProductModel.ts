import { Table, Column, Model, HasMany, Index, Sequelize, DataType } from 'sequelize-typescript';

@Table
export class ProductModel extends Model {
  @Column({
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Index({
    using: 'GIN',
    operator: 'gin_trgm_ops'
  })
  @Column
  name!: string;

  @Column(DataType.JSON)
  data!: any

  @Column(DataType.BOOLEAN)
  enabled!: boolean

}