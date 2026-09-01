// Custom compact serializer that prints each translation object on a single line
export function serializeDiagramData(data) {
  let lines = ['{'];
  const stratKeys = Object.keys(data);

  stratKeys.forEach((stratKey, sIdx) => {
    const strat = data[stratKey];
    lines.push(`  '${stratKey}': {`);
    const fieldKeys = Object.keys(strat);

    fieldKeys.forEach((fieldKey, fIdx) => {
      const val = strat[fieldKey];
      const valStr = JSON.stringify(val);
      const comma = fIdx < fieldKeys.length - 1 ? ',' : '';
      lines.push(`    ${fieldKey}: ${valStr}${comma}`);
    });

    const stratComma = sIdx < stratKeys.length - 1 ? ',' : '';
    lines.push(`  }${stratComma}`);
  });

  lines.push('}');
  return lines.join('\n');
}
