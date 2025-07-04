/**
 * Generates a random number from a normal distribution using the Box-Muller transform
 * @param mean Mean of the distribution
 * @param stdDev Standard deviation of the distribution
 * @returns A random number from the normal distribution
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  return z0 * stdDev + mean;
}

/**
 * Generates a random number from a normal distribution, bounded by min and max values
 * @param mean Mean of the distribution
 * @param stdDev Standard deviation of the distribution
 * @param min Minimum possible value (inclusive)
 * @param max Maximum possible value (inclusive)
 * @param maxAttempts Maximum number of attempts to generate a value within bounds (default: 100)
 * @returns A random number from the normal distribution within the specified bounds
 */
export function boundedRandomNormal(
  mean: number = 0,
  stdDev: number = 1,
  min: number = -Infinity,
  max: number = Infinity,
  maxAttempts: number = 100
): number {
  for (let i = 0; i < maxAttempts; i++) {
    const value = randomNormal(mean, stdDev);
    if (value >= min && value <= max) {
      return value;
    }
  }
  
  // If we couldn't generate a value within bounds after maxAttempts, return the mean
  // clamped to the bounds
  return Math.min(Math.max(mean, min), max);
}
