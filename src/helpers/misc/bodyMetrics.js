export function getCupSizeLabel(cupLetter) {
  const cup = cupLetter.toString().toUpperCase().trim();

  if (!cup || !/^[A-Z]$/.test(cup)) {
    return 'Invalid cup size';
  }

  if (cup === 'A') return 'Flat';
  if (cup === 'B') return 'Small';
  if (['C', 'D'].includes(cup)) return 'Medium';
  if (['E', 'F', 'G'].includes(cup)) return 'Large';
  return 'Huge';
}

export function getBreastBandSize(bust, cup_size) {
  const cupSizeMap = {
    AAA: -7.5,
    AA: -5,
    A: -2.5,
    B: 0,
    C: 2.5,
    D: 5,
    DD: 7.5,
    E: 7.5,
    F: 10,
    FF: 12.5,
    G: 15,
    H: 17.5,
    I: 20,
    J: 22.5,
    K: 25,
    L: 27.5,
    M: 30,
  };

  const normalizedCupSize = cup_size.toUpperCase();
  const cupDifference = cupSizeMap[normalizedCupSize];

  if (cupDifference === undefined) {
    throw new Error(`Invalid cup size. Must be one of: ${Object.keys(cupSizeMap).join(', ')}, but got ${cup_size}`);
  }

  const bandSize = bust - cupDifference;
  const roundedBandSize = Math.round(bandSize / 2) * 2;

  return roundedBandSize;
}

export function getAgeRangeLabel(age) {
  if (age < 0) return 'Invalid age';
  if (age <= 12) return 'Child';
  if (age <= 18) return 'Teenager';
  if (age <= 30) return 'Young Adult';
  if (age <= 50) return 'Adult';
  return 'Senior';
}

export function getBodyType(height, weight, bust, waist, hips) {
  const waistToHipRatio = waist / hips;
  const bustToWaistRatio = bust / waist;

  if (waistToHipRatio < 0.75 && bustToWaistRatio > 1.2) {
    return 'Hourglass';
  } else if (waistToHipRatio < 0.75 && bustToWaistRatio <= 1.2) {
    return 'Pear/Triangle';
  } else if (waistToHipRatio >= 0.75 && waistToHipRatio < 0.85 && bust < hips) {
    return 'Rectangle/Straight';
  } else if (waistToHipRatio >= 0.85) {
    return 'Apple/Round';
  } else if (bust > hips + 5 && bustToWaistRatio > 1.05) {
    return 'Inverted Triangle';
  } else {
    return 'Could not determine - mixed characteristics';
  }
}

export function getBMI(height, weight) {
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal weight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obesity';
}
