import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const AGENT_TAG = "education_agent";
const AGENT_TYPE = "minecraft:agent";
const DEFAULT_NAME = "Agent";
const MAX_DISTANCE = 32;
const STEP_DELAY = 5;

function getAgent(player) {
  return player.dimension.getEntities({
    type: AGENT_TYPE,
    tags: [AGENT_TAG]
  }).sort((a, b) => distanceSquared(a.location, player.location) - distanceSquared(b.location, player.location))[0];
}

function distanceSquared(first, second) {
  const x = first.x - second.x;
  const y = first.y - second.y;
  const z = first.z - second.z;
  return x * x + y * y + z * z;
}

function tell(player, message) {
  player.sendMessage(`§b[Agent]§r ${message}`);
}

function spawnAgent(player) {
  const existing = getAgent(player);
  if (existing) {
    tell(player, "Your agent is already nearby.");
    return existing;
  }

  const location = {
    x: Math.floor(player.location.x) + 1,
    y: Math.floor(player.location.y),
    z: Math.floor(player.location.z)
  };
  const agent = player.dimension.spawnEntity(AGENT_TYPE, location);
  agent.addTag(AGENT_TAG);
  agent.nameTag = DEFAULT_NAME;
  tell(player, "Agent created.");
  return agent;
}

function removeAgent(player) {
  const agent = getAgent(player);
  if (!agent) {
    tell(player, "You do not have an agent nearby.");
    return;
  }
  agent.remove();
  tell(player, "Agent removed.");
}

function showMainMenu(player) {
  const form = new ActionFormData()
    .title("Education Agent")
    .body("Control your programmable companion.")
    .button("Create agent")
    .button("Agent actions")
    .button("Rename agent")
    .button("Remove agent");

  form.show(player).then(response => {
    if (response.canceled) return;
    if (response.selection === 0) spawnAgent(player);
    if (response.selection === 1) showActionsMenu(player);
    if (response.selection === 2) showRenameForm(player);
    if (response.selection === 3) removeAgent(player);
  }).catch(() => tell(player, "The agent menu could not be opened."));
}

function showActionsMenu(player) {
  const agent = getAgent(player);
  if (!agent) {
    tell(player, "Create an agent first.");
    return;
  }

  const form = new ActionFormData()
    .title("Agent actions")
    .body("Choose an instruction for your agent.")
    .button("Move forward")
    .button("Turn left")
    .button("Turn right")
    .button("Collect nearby items")
    .button("Follow me")
    .button("Stop");

  form.show(player).then(response => {
    if (response.canceled) return;
    const actions = [
      () => moveForward(player, agent),
      () => turn(agent, -90),
      () => turn(agent, 90),
      () => collectNearbyItems(player, agent),
      () => follow(player, agent),
      () => tell(player, "Agent stopped.")
    ];
    actions[response.selection]?.();
  }).catch(() => tell(player, "The action menu could not be opened."));
}

function moveForward(player, agent) {
  const direction = agent.getViewDirection();
  const destination = {
    x: agent.location.x + Math.round(direction.x),
    y: agent.location.y,
    z: agent.location.z + Math.round(direction.z)
  };
  agent.teleport(destination, { dimension: agent.dimension, facingLocation: player.location });
  tell(player, "Agent moved forward.");
}

function turn(agent, degrees) {
  const rotation = agent.getRotation();
  agent.setRotation({ x: rotation.x, y: rotation.y + degrees });
}

function collectNearbyItems(player, agent) {
  const items = agent.dimension.getEntities({ location: agent.location, maxDistance: 6, type: "minecraft:item" });
  let collected = 0;
  for (const item of items) {
    item.teleport(agent.location);
    item.addTag("agent_collected");
    collected++;
  }
  tell(player, collected === 0 ? "No nearby items found." : `Agent collected ${collected} item stack(s).`);
}

function follow(player, agent) {
  const target = { ...player.location };
  system.runTimeout(() => {
    if (!agent.isValid || !player.isValid) return;
    if (distanceSquared(agent.location, player.location) > 9) {
      agent.teleport({ x: target.x, y: target.y, z: target.z }, { dimension: player.dimension });
    }
  }, STEP_DELAY);
  tell(player, "Agent is following you.");
}

function showRenameForm(player) {
  const agent = getAgent(player);
  if (!agent) {
    tell(player, "Create an agent first.");
    return;
  }
  const form = new ModalFormData().title("Rename agent").textField("Agent name", "Agent", { defaultValue: agent.nameTag || DEFAULT_NAME });
  form.show(player).then(response => {
    if (response.canceled) return;
    const name = String(response.formValues[0] ?? "").trim().slice(0, 32);
    if (!name) {
      tell(player, "The name cannot be empty.");
      return;
    }
    agent.nameTag = name;
    tell(player, `Agent renamed to ${name}.`);
  }).catch(() => tell(player, "The rename form could not be opened."));
}

world.beforeEvents.chatSend.subscribe(event => {
  const message = event.message.trim().toLowerCase();
  if (message !== "!agent" && message !== "!agent menu") return;
  event.cancel = true;
  system.run(() => showMainMenu(event.sender));
});

world.afterEvents.playerSpawn.subscribe(event => {
  if (!event.initialSpawn) return;
  event.player.sendMessage("§bEducation Agent§r is ready. Type §f!agent§r to open the interface.");
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const agent = getAgent(player);
    if (!agent || distanceSquared(agent.location, player.location) > MAX_DISTANCE * MAX_DISTANCE) continue;
    const nearby = agent.dimension.getEntities({ location: agent.location, maxDistance: 2, type: "minecraft:item" });
    for (const item of nearby) {
      if (!item.hasTag("agent_collected")) item.addTag("agent_collected");
    }
  }
}, 20);
