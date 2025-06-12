import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { InvoiceItemEntity } from "./InvoiceItemEntity";

@Entity("invoices")
export class InvoiceEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  customerName!: string;

  @Column({ type: "datetime" })
  date!: Date;

  @OneToMany(() => InvoiceItemEntity, item => item.invoice, {
    cascade: true,      
    eager: true          
  })
  items!: InvoiceItemEntity[];
}
