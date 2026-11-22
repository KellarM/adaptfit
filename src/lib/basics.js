// Turns what the AI pulled out of the person's own words into form values.
export function factsToForm(facts) {
  if (!facts) return {};
  const patch = {};
  if (facts.display_name) patch.display_name = facts.display_name;
  if (facts.age !== undefined && facts.age !== null && Number(facts.age) > 0) {
    patch.age = Number(facts.age);
  }
  if (facts.experience) patch.experience = facts.experience;
  if (facts.goals?.length) patch.goals = facts.goals;
  if (Number(facts.weekly_target) >= 2) patch.weekly_target = Number(facts.weekly_target);
  if (Number(facts.session_minutes) >= 10) patch.session_minutes = Number(facts.session_minutes);
  return patch;
}