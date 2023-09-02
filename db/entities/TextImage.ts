import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TextImage extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({nullable:false})
  imagepath: string;

  @Column({nullable: false, default: 'Nothing Detected.'})
  result: string;
}