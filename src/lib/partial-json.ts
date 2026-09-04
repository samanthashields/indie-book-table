/** Best-effort parse of a JSON document that is still streaming in. */
export function parsePartialJson<T>(text: string): Partial<T> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  for (let end = trimmed.length; end > 0; end--) {
    const candidate = repair(trimmed.slice(0, end));
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as Partial<T>;
    } catch {
      // keep walking back
    }
    // only retry at plausible boundaries to stay cheap
    while (end > 1 && !',}]"'.includes(trimmed[end - 2] ?? "")) end--;
  }
  return null;
}

function repair(text: string): string | null {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{" || char === "[") stack.push(char);
    else if (char === "}" || char === "]") stack.pop();
  }

  if (escaped) return null;
  let out = text;
  if (inString) out += '"';
  out = out.replace(/([,:])\s*$/, "");
  if (out.trimEnd().endsWith(",")) out = out.trimEnd().slice(0, -1);
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i] === "{" ? "}" : "]";
  return out;
}
