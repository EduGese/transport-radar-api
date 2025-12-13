import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vehicles' })
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'aircraft' | 'train';

  @Column({ type: 'varchar', length: 32, nullable: true })
  callsign: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    name: 'origin_country',
    nullable: true,
  })
  originCountry: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({ type: 'integer', nullable: true })
  altitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  heading: number | null;

  @Column({ type: 'double precision', nullable: true })
  speed: number | null;
}
