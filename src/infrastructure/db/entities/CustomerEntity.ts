import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("customers")
export class CustomerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;
}
