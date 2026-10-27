import { MuscleGroup } from '../models/models';

export interface ExerciseAsset {
  image: string;
  muscleGroup: MuscleGroup;
  primary: string;
  secondary: string[];
}

/**
 * Recursos anatómicos específicos de cada ejercicio.
 *
 * IMPORTANTE:
 * La clave corresponde al ID REAL del ejercicio en MariaDB.
 *
 * La correspondencia de las imágenes es:
 *
 * ID 1  → exercise-01.webp
 * ID 2  → exercise-02.webp
 * ID 3  → exercise-03.webp
 * ...
 * ID 30 → exercise-30.webp
 *
 * Es decir, el ID del ejercicio coincide directamente
 * con el número de su ilustración.
 */
export const EXERCISE_ASSETS: Record<number, ExerciseAsset> = {

  // ============================================================
  // PECHO
  // ============================================================

  1: {
    image: 'assets/exercises/exercise-01.webp',
    muscleGroup: 'pecho',
    primary: 'Pectoral mayor',
    secondary: [
      'Deltoides anterior',
      'Tríceps braquial'
    ]
  },

  2: {
    image: 'assets/exercises/exercise-02.webp',
    muscleGroup: 'pecho',
    primary: 'Pectoral mayor (porción superior)',
    secondary: [
      'Deltoides anterior',
      'Tríceps braquial'
    ]
  },

  3: {
    image: 'assets/exercises/exercise-03.webp',
    muscleGroup: 'pecho',
    primary: 'Pectoral mayor',
    secondary: [
      'Deltoides anterior',
      'Serrato anterior'
    ]
  },

  4: {
    image: 'assets/exercises/exercise-04.webp',
    muscleGroup: 'pecho',
    primary: 'Pectoral mayor',
    secondary: [
      'Tríceps braquial',
      'Deltoides anterior'
    ]
  },

  5: {
    image: 'assets/exercises/exercise-05.webp',
    muscleGroup: 'pecho',
    primary: 'Pectoral mayor',
    secondary: [
      'Deltoides anterior',
      'Serrato anterior'
    ]
  },

  // ============================================================
  // HOMBRO
  // ============================================================

  6: {
    image: 'assets/exercises/exercise-06.webp',
    muscleGroup: 'hombro',
    primary: 'Deltoides anterior',
    secondary: [
      'Deltoides lateral',
      'Tríceps braquial'
    ]
  },

  7: {
    image: 'assets/exercises/exercise-07.webp',
    muscleGroup: 'hombro',
    primary: 'Deltoides anterior',
    secondary: [
      'Deltoides lateral',
      'Tríceps braquial'
    ]
  },

  8: {
    image: 'assets/exercises/exercise-08.webp',
    muscleGroup: 'hombro',
    primary: 'Deltoides lateral',
    secondary: [
      'Deltoides anterior',
      'Trapecio'
    ]
  },

  9: {
    image: 'assets/exercises/exercise-09.webp',
    muscleGroup: 'hombro',
    primary: 'Deltoides anterior',
    secondary: [
      'Deltoides lateral',
      'Trapecio'
    ]
  },

  10: {
    image: 'assets/exercises/exercise-10.webp',
    muscleGroup: 'hombro',
    primary: 'Deltoides posterior',
    secondary: [
      'Trapecio',
      'Romboides'
    ]
  },

  // ============================================================
  // ESPALDA
  // ============================================================

  11: {
    image: 'assets/exercises/exercise-11.webp',
    muscleGroup: 'espalda',
    primary: 'Dorsal ancho',
    secondary: [
      'Bíceps braquial',
      'Trapecio',
      'Romboides'
    ]
  },

  12: {
    image: 'assets/exercises/exercise-12.webp',
    muscleGroup: 'espalda',
    primary: 'Dorsal ancho',
    secondary: [
      'Bíceps braquial',
      'Redondo mayor'
    ]
  },

  13: {
    image: 'assets/exercises/exercise-13.webp',
    muscleGroup: 'espalda',
    primary: 'Dorsal ancho',
    secondary: [
      'Trapecio',
      'Romboides',
      'Bíceps braquial'
    ]
  },

  14: {
    image: 'assets/exercises/exercise-14.webp',
    muscleGroup: 'espalda',
    primary: 'Dorsal ancho',
    secondary: [
      'Romboides',
      'Trapecio',
      'Bíceps braquial'
    ]
  },

  15: {
    image: 'assets/exercises/exercise-15.webp',
    muscleGroup: 'espalda',
    primary: 'Dorsal ancho',
    secondary: [
      'Serrato anterior',
      'Redondo mayor'
    ]
  },

  // ============================================================
  // PIERNA
  // ============================================================

  16: {
    image: 'assets/exercises/exercise-16.webp',
    muscleGroup: 'pierna',
    primary: 'Cuádriceps',
    secondary: [
      'Glúteos',
      'Isquiotibiales',
      'Aductores'
    ]
  },

  17: {
    image: 'assets/exercises/exercise-17.webp',
    muscleGroup: 'pierna',
    primary: 'Cuádriceps',
    secondary: [
      'Glúteos',
      'Isquiotibiales'
    ]
  },

  18: {
    image: 'assets/exercises/exercise-18.webp',
    muscleGroup: 'pierna',
    primary: 'Isquiotibiales',
    secondary: [
      'Glúteos',
      'Erectores espinales'
    ]
  },

  19: {
    image: 'assets/exercises/exercise-19.webp',
    muscleGroup: 'pierna',
    primary: 'Cuádriceps',
    secondary: [
      'Vasto medial',
      'Vasto lateral'
    ]
  },

  20: {
    image: 'assets/exercises/exercise-20.webp',
    muscleGroup: 'pierna',
    primary: 'Isquiotibiales',
    secondary: [
      'Bíceps femoral',
      'Semitendinoso',
      'Semimembranoso'
    ]
  },

  21: {
    image: 'assets/exercises/exercise-21.webp',
    muscleGroup: 'pierna',
    primary: 'Gemelos (gastrocnemio)',
    secondary: [
      'Sóleo'
    ]
  },

  // ============================================================
  // BÍCEPS
  // ============================================================

  22: {
    image: 'assets/exercises/exercise-22.webp',
    muscleGroup: 'biceps',
    primary: 'Bíceps braquial',
    secondary: [
      'Braquial',
      'Braquiorradial'
    ]
  },

  23: {
    image: 'assets/exercises/exercise-23.webp',
    muscleGroup: 'biceps',
    primary: 'Bíceps braquial',
    secondary: [
      'Braquial',
      'Braquiorradial'
    ]
  },

  24: {
    image: 'assets/exercises/exercise-24.webp',
    muscleGroup: 'biceps',
    primary: 'Braquial',
    secondary: [
      'Bíceps braquial',
      'Braquiorradial'
    ]
  },

  25: {
    image: 'assets/exercises/exercise-25.webp',
    muscleGroup: 'biceps',
    primary: 'Bíceps braquial',
    secondary: [
      'Braquial',
      'Braquiorradial'
    ]
  },

  // ============================================================
  // TRÍCEPS
  // ============================================================

  26: {
    image: 'assets/exercises/exercise-26.webp',
    muscleGroup: 'triceps',
    primary: 'Tríceps braquial',
    secondary: [
      'Pectoral mayor',
      'Deltoides anterior'
    ]
  },

  27: {
    image: 'assets/exercises/exercise-27.webp',
    muscleGroup: 'triceps',
    primary: 'Tríceps braquial',
    secondary: [
      'Ancóneo',
      'Deltoides anterior'
    ]
  },

  28: {
    image: 'assets/exercises/exercise-28.webp',
    muscleGroup: 'triceps',
    primary: 'Tríceps braquial',
    secondary: [
      'Deltoides anterior'
    ]
  },

  29: {
    image: 'assets/exercises/exercise-29.webp',
    muscleGroup: 'triceps',
    primary: 'Tríceps braquial',
    secondary: [
      'Deltoides anterior',
      'Pectoral menor'
    ]
  },

  30: {
    image: 'assets/exercises/exercise-30.webp',
    muscleGroup: 'triceps',
    primary: 'Tríceps braquial',
    secondary: [
      'Ancóneo',
      'Deltoides anterior'
    ]
  }
};


/**
 * Devuelve los recursos anatómicos de un ejercicio.
 */
export function getExerciseAsset(
  exerciseId: number
): ExerciseAsset | null {
  return EXERCISE_ASSETS[exerciseId] ?? null;
}


/**
 * Devuelve únicamente la ruta de la ilustración.
 */
export function getExerciseIllustration(
  exerciseId: number
): string | null {
  return EXERCISE_ASSETS[exerciseId]?.image ?? null;
}


/**
 * Devuelve la ruta de la ilustración utilizada
 * directamente por los componentes de Angular.
 *
 * Siempre devuelve un string.
 */
export function getExerciseImage(
  exerciseId: number
): string {
  return EXERCISE_ASSETS[exerciseId]?.image
    ?? 'assets/exercises/exercise-01.webp';
}