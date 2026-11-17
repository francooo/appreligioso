import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { monthTitle } from '../lib/format';
import { colors, fonts } from '../theme';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

type Props = {
  /** Qualquer data dentro do mês exibido. */
  month: Date;
  /** Dias do mês (1–31) com registro. */
  marked: Set<number>;
  selected?: number | null;
  onSelect?: (day: number) => void;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  legend?: string;
};

// Calendário mensal do Histórico (W13): dias com registro em círculos pêssego.
export function Calendar({ month, marked, selected, onSelect, onPrev, onNext, nextDisabled, legend }: Props) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable onPress={onPrev} hitSlop={10} accessibilityLabel="Mês anterior">
          <Ionicons name="chevron-back" size={16} color={colors.navy} />
        </Pressable>
        <Text style={styles.title}>{monthTitle(month)}</Text>
        <Pressable
          onPress={onNext}
          disabled={nextDisabled}
          hitSlop={10}
          accessibilityLabel="Próximo mês"
          style={nextDisabled ? { opacity: 0.3 } : undefined}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.navy} />
        </Pressable>
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const isMarked = marked.has(day);
            const isSelected = selected === day;
            return (
              <View key={i} style={styles.cell}>
                <Pressable
                  onPress={() => onSelect?.(day)}
                  disabled={!isMarked || !onSelect}
                  accessibilityRole="button"
                  accessibilityLabel={`${day}${isMarked ? ', com registro' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.day, isMarked && styles.marked, isSelected && styles.selected]}
                >
                  <Text style={[styles.dayText, isMarked && styles.markedText, isSelected && styles.selectedText]}>
                    {day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}

      {legend ? (
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>{legend}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  title: { fontFamily: fonts.serif, fontSize: 20, color: colors.title },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 11, color: colors.muted, paddingVertical: 6 },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  day: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  marked: { backgroundColor: colors.peach },
  selected: { backgroundColor: colors.gold },
  dayText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  markedText: { fontFamily: fonts.semibold, color: colors.tagText },
  selectedText: { color: colors.white },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.peach },
  legendText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
});
