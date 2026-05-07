/**
 * Strips noise from scaffold HTML so the mentor AI can read
 * semantic structure and user-entered values without token bloat.
 */
export function stripScaffoldForContext(html: string): string {
  let s = html;

  // Remove <style>, <script>, <head> blocks
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<head[\s\S]*?<\/head>/gi, "");

  // Remove class and style attributes
  s = s.replace(/\s+(class|style)="[^"]*"/gi, "");

  // Remove doctype, html, body wrapper tags (keep inner content)
  s = s.replace(/<!DOCTYPE[^>]*>/gi, "");
  s = s.replace(/<\/?html[^>]*>/gi, "");
  s = s.replace(/<\/?body[^>]*>/gi, "");

  // Collapse blank lines
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}
