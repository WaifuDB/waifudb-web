export function getZodiacSign(birthDate) {
  const [month, day] = birthDate.split(' ');
  const monthNumber = new Date(Date.parse(`${month} 1, 2020`)).getMonth() + 1;
  const dayNumber = parseInt(day, 10);

  const zodiacSigns = [
    { name: 'Capricorn', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', start: [2, 19], end: [3, 20] },
    { name: 'Aries', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', start: [6, 21], end: [7, 22] },
    { name: 'Leo', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', start: [8, 23], end: [9, 22] },
    { name: 'Libra', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
  ];

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if ((monthNumber === startMonth && dayNumber >= startDay) || (monthNumber === endMonth && dayNumber <= endDay)) {
      return sign.name;
    }
  }

  return 'Unknown Zodiac Sign';
}

export function getGenderLabel(gender) {
  let label = 'Unknown';
  let symbol = '❓';
  switch (gender) {
    case 'male':
      label = 'Male';
      symbol = '♂️';
      break;
    case 'female':
      label = 'Female';
      symbol = '♀️';
      break;
    case 'non-binary':
      label = 'Non-binary';
      symbol = '⚧️';
      break;
    case 'other':
      label = 'Other';
      symbol = '⚧️';
      break;
    default:
      label = 'Unknown';
      symbol = '❓';
      break;
  }

  return {
    label,
    symbol,
  };
}
