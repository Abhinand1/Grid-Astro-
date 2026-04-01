export interface PoruthamExplanation {
  title: string;
  malayalamTitle: string;
  description: string;
  malayalamDescription: string;
}

export const PORUTHAM_EXPLANATIONS: Record<string, PoruthamExplanation> = {
  'Rasi': {
    title: 'Rasi Porutham',
    malayalamTitle: 'രാശി പൊരുത്തം',
    description: 'Indicates the compatibility of the zodiac signs. It is crucial for the overall harmony and prosperity of the couple.',
    malayalamDescription: 'ദമ്പതികളുടെ ആയുസ്സ്, ആരോഗ്യം, ഐശ്വര്യം എന്നിവയെ സൂചിപ്പിക്കുന്നു. രാശികൾ തമ്മിലുള്ള പൊരുത്തം കുടുംബജീവിതത്തിലെ സമാധാനത്തിന് പ്രധാനമാണ്.'
  },
  'Rasyadhipathi': {
    title: 'Rasyadhipathi Porutham',
    malayalamTitle: 'രാശ്യാധിപതി പൊരുത്തം',
    description: 'Checks the friendship between the lords of the birth signs. Good compatibility ensures children and mutual affection.',
    malayalamDescription: 'ജന്മരാശികളുടെ അധിപന്മാർ തമ്മിലുള്ള ബന്ധം പരിശോധിക്കുന്നു. ഇത് ദമ്പതികൾ തമ്മിലുള്ള സ്നേഹത്തെയും സന്താനഭാഗ്യത്തെയും സൂചിപ്പിക്കുന്നു.'
  },
  'Vasya': {
    title: 'Vasya Porutham',
    malayalamTitle: 'വശ്യ പൊരുത്തം',
    description: 'Determines the mutual attraction and magnetic pull between the partners.',
    malayalamDescription: 'ദമ്പതികൾ തമ്മിലുള്ള പരസ്പര ആകർഷണത്തെയും സ്നേഹത്തെയും ഇത് സൂചിപ്പിക്കുന്നു.'
  },
  'Mahendra': {
    title: 'Mahendra Porutham',
    malayalamTitle: 'മഹേന്ദ്ര പൊരുത്തം',
    description: 'Signifies wealth, longevity, and the well-being of children.',
    malayalamDescription: 'സന്താനഭാഗ്യം, ദീർഘായുസ്സ്, ഐശ്വര്യം എന്നിവയെ ഇത് സൂചിപ്പിക്കുന്നു.'
  },
  'Gana': {
    title: 'Gana Porutham',
    malayalamTitle: 'ഗണ പൊരുത്തം',
    description: 'Matches the temperaments of the couple (Deva, Manushya, or Asura). It ensures mental compatibility.',
    malayalamDescription: 'ദമ്പതികളുടെ സ്വഭാവം തമ്മിലുള്ള പൊരുത്തം പരിശോധിക്കുന്നു. മാനസികമായ ഐക്യത്തിന് ഇത് വളരെ പ്രധാനമാണ്.'
  },
  'Yoni': {
    title: 'Yoni Porutham',
    malayalamTitle: 'യോനി പൊരുത്തം',
    description: 'Indicates sexual compatibility and physical intimacy between the partners.',
    malayalamDescription: 'ദമ്പതികൾ തമ്മിലുള്ള ശാരീരിക പൊരുത്തത്തെയും ലൈംഗിക സംതൃപ്തിയെയും ഇത് സൂചിപ്പിക്കുന്നു.'
  },
  'Dina': {
    title: 'Dina Porutham',
    malayalamTitle: 'ദിന പൊരുത്തം',
    description: 'Ensures a long and healthy life for the couple, free from major illnesses.',
    malayalamDescription: 'ദമ്പതികളുടെ ദീർഘായുസ്സിനെയും ആരോഗ്യത്തെയും ഇത് സൂചിപ്പിക്കുന്നു.'
  },
  'Stree Deergha': {
    title: 'Stree Deergha Porutham',
    malayalamTitle: 'സ്ത്രീ ദീർഘ പൊരുത്തം',
    description: 'Ensures the longevity and prosperity of the wife.',
    malayalamDescription: 'സ്ത്രീയുടെ ദീർഘായുസ്സിനും ഐശ്വര്യത്തിനും ഈ പൊരുത്തം ഉത്തമമാണ്.'
  },
  'Rajju': {
    title: 'Rajju Porutham',
    malayalamTitle: 'രജ്ജു പൊരുത്തം',
    description: 'The most critical porutham. It ensures the longevity of the husband and the stability of the marriage.',
    malayalamDescription: 'ഏറ്റവും പ്രധാനപ്പെട്ട പൊരുത്തമാണിത്. ഭർത്താവിന്റെ ദീർഘായുസ്സിനെയും ദാമ്പത്യത്തിന്റെ കെട്ടുറപ്പിനെയും ഇത് സൂചിപ്പിക്കുന്നു.'
  },
  'Vedha': {
    title: 'Vedha Porutham',
    malayalamTitle: 'വേധ പൊരുത്തം',
    description: 'Checks for hidden afflictions. Absence of Vedha ensures a life free from major obstacles and sorrows.',
    malayalamDescription: 'ദമ്പതികൾക്കിടയിൽ വരാവുന്ന തടസ്സങ്ങളെയും ദുഃഖങ്ങളെയും ഇത് പരിശോധിക്കുന്നു. വേധമില്ലാത്തത് ഉത്തമമാണ്.'
  }
};
