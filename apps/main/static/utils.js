
export function toggleSet(s, o) {
  if (s.has(o)) s.delete(o);
  else s.add(o);
}

