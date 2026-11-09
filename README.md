# Minecraft Bedrock Agent Companion Add-On

Agent Companion is a scripted Minecraft Bedrock add-on that gives players an in-game menu to create, rename, and remove an Agent, then issue basic movement, turning, item-handling, and follow instructions using the Minecraft scripting APIs.

## Install

1. Download or clone the project.
2. Copy the `behavior_pack` folder into Minecraft’s `development_behavior_packs` folder for your installation.
3. Start a compatible Minecraft world and open its settings.
4. Activate **Education Agent Add-On - Behavior Pack** under Behavior Packs. Enable any scripting or creator experiments the game requires.
5. Enter the world and check that the behavior pack is active.

## Use

1. Type `!agent` or `!agent menu` in chat to open the interface.
2. Select **Create agent** to spawn an Agent nearby.
3. Use **Agent actions** to move it forward, turn it left or right, handle nearby item entities, or issue a follow instruction.
4. Choose **Rename agent** to set its name, or **Remove agent** to remove it.

The follow instruction performs a single delayed teleport toward the player; it is not continuous pathfinding. The nearby-item action moves item entities to the Agent and tags them. It does not transfer items into a player’s inventory. The **Stop** option displays a message and does not cancel an ongoing movement process.

---

More Minecraft plugin projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/4b7c8137-a635-4f69-8834-e540634c9ae0?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=4b7c8137-a635-4f69-8834-e540634c9ae0
