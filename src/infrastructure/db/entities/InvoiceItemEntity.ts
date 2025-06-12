import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { InvoiceEntity } from "./InvoiceEntity";

@Entity("invoice_items")
export class InvoiceItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  productName!: string;

  @Column("int")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number;

  @ManyToOne(() => InvoiceEntity, invoice => invoice.items, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "invoiceId" })
  invoice!: InvoiceEntity;
}
