import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FILLED = '#F5A623';
const EMPTY = '#E0E0E0';

export default function StarRating({ rating = 5, onRate = () => {}, size = 20, editable = true }) {
  const stars = [1,2,3,4,5];
  return (
    <View style={styles.row}>
      {stars.map((s) => {
        const filled = s <= rating;
        return (
          <TouchableOpacity
            key={s}
            onPress={() => editable && onRate(s)}
            disabled={editable === false}
            accessibilityLabel={`Rate ${s}`}
          >
            <Text style={[styles.star, { color: filled ? FILLED : EMPTY, fontSize: size }]}>{'★'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  star: { marginHorizontal: 2 }
});
