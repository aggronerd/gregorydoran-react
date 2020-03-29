import React from 'react';

interface Props {
    // Animates from this string to the to string (must be anagrams)
    from: string;

    // Animates to this string to this string (must be anagrams)
    to: string;
}

export default function AnimatedAnagram(props: Props) {
    const letters: Set<string>;

    props.from.split('').forEach((char: string) => {
        letters.add(char);
    })
}