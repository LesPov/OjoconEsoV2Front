// src/app/admin/interfaces/socioDemographic.interface.ts
export interface SocioDemographicData {
    id: number;
    userId: number;
    residenceYears: number;
    residenceMonths: number;
    selfIdentification: 'Campesino(a)' | 'Trabajador(a) rural' | 'Habitante rural' | 'Otro';
    otherIdentification?: string;
    ethnicGroup: 'Indígena' | 'Afrocolombiano' | 'Raizales' | 'ROM o gitano' | 'Ninguno';
    ethnicGroupDetail?: string;
    hasDisability: boolean;
    disabilityDetail?: string;
    conflictVictim: boolean;
    educationLevel: 'Ninguna' | 'Primaria' | 'Secundaria' | 'Técnico o Tecnológico' | 'Profesional' | 'Posgrado';
    createdAt?: string;
    updatedAt?: string;
  }
  