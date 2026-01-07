import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'aircraft', synchronize: false })
export class AircraftEntity {
  @PrimaryColumn({ type: 'varchar', length: 6, name: 'icao24' })
  icao24: string;

  @Column({ type: 'text', nullable: true })
  category_description: string | null;

  @Column({ type: 'text', nullable: true })
  model: string | null;

  @Column({ type: 'text', nullable: true })
  operator: string | null;

  @Column({ type: 'text', nullable: true })
  operator_icao: string | null;

  @Column({ type: 'text', nullable: true })
  owner: string | null;
}
