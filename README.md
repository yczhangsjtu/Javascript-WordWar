# Javascript-WordWar

A javascript game for memorizing English words and their Chinese meanings.

Initially you have several buildings, including a training center and four towers.
Control everything by command.

## Basic operations

- `train [trainingcenter] [word]`: a troop of code `word` will appear near the training center.
- `move [word1] [word2]`: the troop of code `word1` will move to place of code `word2`.
- `build [word] [training|tower]`: if the troop `word` is exactly in place of code `word`, this troop will transform into a building (training center or tower).

There is no limit in how many troops you can train. There is no time delay in everything you do.
Everything depends on your type speed! The key is to never stop hitting the keyboard!

Theoretically, computer can do anything at infinite speed, the AI just limit the pace by design.

## Hand over the control to AI

You can let the AI take control.

- `defend`: turn automatic defending on.
- `auto attack`: turn automatic attacking on.
- `auto train`: turn automatic training on.

Your AI is basically the same to that of the computers'.
Current AI is very simple. They train troops in a specific pace.
They first arrange some troops for defending, putting them in specific places with respect to the training center.
When there are more troops, they maintain four groups of specific size somewhere a bit away from the traning center.
When the maximal number is reached, they launch the attack to the nearest training centers.

Once being attacked, AI will immediately move all the troops to where there are enemies for defence.

Currently AI does not construct buildings. They train troops randomly instead of with design.

## Strategies

At the beginning, you'd better let AI take everything into control, and you help the AI train more troops.
With higher training speed than others, you have a better chance to survive the initial expiration, depending on your type speed.

When there are only a few forces left, relatively far from each other, AI can hardly win (though not easy to loose, either).
You can try turning off the auto attack and auto defend, so that you can control your troops, move words into exact places to build more towers.

With current AI level, it seems that the only way to win is to occupy larger area with training centers and towers, until reaching the enemy.

