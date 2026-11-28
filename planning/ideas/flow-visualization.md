# Flow visualization

The thesis UI colored surface particles by speed (red right, green left); the new UI drops this. Idea for showing
the flow direction instead, like wind maps on 2D weather maps:

- Trace lines: each particle gets a random fixed height within the water column (fraction of the local fluid height);
  draw a short fading trail of its recent positions (x, ground + fraction · fluid height).
- Open: readability with many particles (draw a subset?), cost of keeping trail history, look in still water.

Not sure it works well – try it in a mockup first.
