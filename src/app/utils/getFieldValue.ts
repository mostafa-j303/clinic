export default function getFieldValue(field: any) {
  return Array.isArray(field) ? field[0]?.value : field?.value;
}
