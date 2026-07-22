export type Recommendation = {
  /** The content itself, readable in place. Separate paragraphs with \n\n. */
  text: string;
  /** Source link shown below the text. */
  source?: { label: string; url: string };
};

/** "Worth the time" — words worth returning to, readable right here. */
export const recommendations: Recommendation[] = [
  {
    text: 'Life is an internal game played in an external arena.',
    source: { label: '@Stealx', url: 'https://x.com/Stealx/status/2079389763312767164' },
  },
  {
    text: 'The quickest way to “get your spark back” is to literally light yourself on fire. You’ve got to burn baby. You’re depressed bc you’re not being insane enough. Double. Down. The world does not reward half ass. All in or out. You’re thinking too small. You’ve accepted your current reality as the only reality. Bullshit. You need to write a list of the most insane asks you could ever dream of. “I am a NYT best selling author. I am the founder of a Fortune 500 company. I paint for a living and I make a damn good living.” Ask and you shall receive. Embody and you become. Flip the fucking script. Your current ceiling is now the floor. Level up.\n\nYou need to burn.',
    source: { label: '@rachcorrine', url: 'https://x.com/rachcorrine/status/2078556350246773156' },
  },
  {
    text: 'Naval — How to Get Rich: wealth creation distilled into principles.',
    source: { label: '@naval', url: 'https://twitter.com/naval/status/1002103360646823936' },
  },
];
