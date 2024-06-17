import { Table, Column, Model, HasMany, Index, Sequelize, DataType, Unique } from 'sequelize-typescript';
import bcrypt, { genSaltSync } from 'bcrypt'


@Table
export class UserModel extends Model {
  @Column({
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;
  
  @Column({
    unique: true
  })
  name!: string;

  @Column
  passwordHash!: string

  setPassword(password: string) {
    const hash = bcrypt.hashSync(password, 10)

    this.passwordHash = hash

    this.save()
  }

  verifyPassword(password: string) {
    return bcrypt.compareSync(password, this.passwordHash)
  }
  
}