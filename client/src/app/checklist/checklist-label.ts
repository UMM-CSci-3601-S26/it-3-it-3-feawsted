import { SupplyList } from '../supplylist/supplylist';

function formatAllOf(attr: { allOf: string[] } | undefined, prefix: string): string {
  if (!attr || !attr.allOf || attr.allOf.length === 0) return '';
  const n = attr.allOf.length;
  if (n === 1) return prefix + attr.allOf[0];
  return prefix + attr.allOf.slice(0, n - 1).join(', ') + (n > 1 ? ', and ' : '') + attr.allOf[n - 1];
}

function formatAnyOf(attr: { anyOf: string[] } | undefined): string {
  if (!attr || !attr.anyOf || attr.anyOf.length === 0) return '';
  const n = attr.anyOf.length;
  if (n === 1) return ' (' + attr.anyOf[0] + ')';
  return ' (' + attr.anyOf.slice(0, n - 1).join(', ') + (n > 1 ? ', or ' : '') + attr.anyOf[n - 1] + ')';
}

export function supplyToLabel(s: SupplyList): string {
  let label = '';
  if (s.quantity > 0) {
    label += s.quantity + ' ';
  }
  if (s.count > 1) {
    label += s.count + 'ct ';
  }
  if (s.size && s.size !== 'N/A') {
    label += s.size;
    if (s.quantity > 1) {
      label += 's';
    }
    label += ' of ';
  }
  if (s.item && s.item.length > 0) {
    label += s.item.join(' or ');
    if (s.quantity > 1 && s.item.length === 1 && !s.item[0].endsWith('s')) {
      label += 's';
    }
    label += ' ';
  }
  const allOfStr = [
    formatAllOf(s.type, ''),
    formatAllOf(s.color, ''),
    formatAllOf(s.brand, ''),
    formatAllOf(s.material, ''),
    formatAllOf(s.style, '')
  ].filter(Boolean).join(', ');
  if (allOfStr) {
    label += allOfStr;
  }
  const anyOfStr = [
    formatAnyOf(s.type),
    formatAnyOf(s.color),
    formatAnyOf(s.brand),
    formatAnyOf(s.material),
    formatAnyOf(s.style)
  ].filter(Boolean).join('');
  if (anyOfStr) {
    label += anyOfStr;
  }
  if (s.notes && s.notes !== 'N/A') {
    label += ' (' + s.notes + ')';
  }
  return label.trim();
}
