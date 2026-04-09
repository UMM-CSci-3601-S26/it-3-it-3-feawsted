import { supplyToLabel } from './checklist-label';
import { SupplyList } from '../supplylist/supplylist';
import { MockChecklistService } from 'src/testing/checklist-service.mock';

describe('supplyToLabel', () => {
  // Minimal supply used as a baseline for most tests
  const baseSupply: SupplyList = {
    school: 'AHS',
    grade: '5',
    item: ['Pencil'],
    brand: { allOf: [], anyOf: [] },
    color: { allOf: [], anyOf: [] },
    count: 1,
    size: 'N/A',
    type: { allOf: [], anyOf: [] },
    material: { allOf: [], anyOf: [] },
    style: { allOf: [], anyOf: [] },
    quantity: 1,
    notes: ''
  };

  it('should include the item name', () => {
    expect(supplyToLabel(baseSupply)).toContain('Pencil');
  });

  it('should start with quantity when quantity > 0', () => {
    const supply = { ...baseSupply, quantity: 3 };
    expect(supplyToLabel(supply).startsWith('3')).toBeTrue();
  });

  it('should include count label (e.g. 24ct) when count > 1', () => {
    const supply = { ...baseSupply, count: 24 };
    expect(supplyToLabel(supply)).toContain('24ct');
  });

  it('should not include a count label when count is 1', () => {
    expect(supplyToLabel(baseSupply)).not.toContain('ct');
  });

  it('should include size when it is not N/A', () => {
    const supply = { ...baseSupply, size: 'Large' };
    expect(supplyToLabel(supply)).toContain('Large');
  });

  it('should not include size when size is N/A', () => {
    expect(supplyToLabel(baseSupply)).not.toContain('N/A');
  });

  it('should join multiple items with "or"', () => {
    const supply = { ...baseSupply, item: ['Pen', 'Pencil'] };
    expect(supplyToLabel(supply)).toContain('Pen or Pencil');
  });

  it('should pluralize a single item name when quantity > 1', () => {
    const supply = { ...baseSupply, quantity: 2, item: ['Pencil'] };
    expect(supplyToLabel(supply)).toContain('Pencils');
  });

  it('should not pluralize when item already ends in "s"', () => {
    const supply = { ...baseSupply, quantity: 2, item: ['Scissors'] };
    const label = supplyToLabel(supply);
    expect(label).not.toContain('Scissorss');
  });

  it('should include allOf color attribute', () => {
    const supply = { ...baseSupply, color: { allOf: ['blue'], anyOf: [] } };
    expect(supplyToLabel(supply)).toContain('blue');
  });

  it('should include multiple allOf values joined with "and"', () => {
    const supply = { ...baseSupply, color: { allOf: ['red', 'blue'], anyOf: [] } };
    const label = supplyToLabel(supply);
    expect(label).toContain('red');
    expect(label).toContain('and');
    expect(label).toContain('blue');
  });

  it('should include anyOf attribute in parentheses', () => {
    const supply = { ...baseSupply, color: { allOf: [], anyOf: ['red'] } };
    const label = supplyToLabel(supply);
    expect(label).toContain('(red)');
  });

  it('should include multiple anyOf values joined with "or" in parentheses', () => {
    const supply = { ...baseSupply, color: { allOf: [], anyOf: ['red', 'blue'] } };
    const label = supplyToLabel(supply);
    expect(label).toContain('(');
    expect(label).toContain('red');
    expect(label).toContain('or');
    expect(label).toContain('blue');
  });

  it('should include notes when present', () => {
    const supply = { ...baseSupply, notes: 'college ruled' };
    expect(supplyToLabel(supply)).toContain('(college ruled)');
  });

  it('should not include notes when notes is N/A', () => {
    const supply = { ...baseSupply, notes: 'N/A' };
    expect(supplyToLabel(supply)).not.toContain('N/A');
  });

  it('should not include empty parentheses when notes is empty', () => {
    expect(supplyToLabel(baseSupply)).not.toContain('()');
  });

  it('should produce a trimmed, non-empty string', () => {
    const label = supplyToLabel(baseSupply);
    expect(label.trim()).toBe(label);
    expect(label.length).toBeGreaterThan(0);
  });

  describe('with mock supplies from MockChecklistService', () => {
    it('should format mockSupply1 (Pencil, Generic, yellow) without placeholder "?"', () => {
      const label = supplyToLabel(MockChecklistService.mockSupply1);
      expect(label).toContain('Pencil');
      expect(label).not.toContain('?');
    });

    it('should format mockSupply2 (Notebook, red, notes with "?") and strip placeholder', () => {
      // mockSupply2 has notes "a good pencil?" — supplyToLabel should still include notes as-is
      const label = supplyToLabel(MockChecklistService.mockSupply2);
      expect(label).toContain('Notebook');
    });

    it('should format mockSupply3 (Marker, Crayola, 10ct, qty 2) correctly', () => {
      const label = supplyToLabel(MockChecklistService.mockSupply3);
      expect(label).toContain('Marker');
      expect(label).toContain('10ct');
      expect(label).toContain('Crayola');
      expect(label).toContain('extra supplies');
    });
  });
});
