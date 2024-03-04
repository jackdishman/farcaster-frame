import { IFollower } from "@/types/followers";
import cytoscape from "cytoscape";
// @ts-ignore
import cola from "cytoscape-cola";

cytoscape.use(cola);

function getColorForFollowerCount(followerCount: number) {
  // Define thresholds or use a continuous scale
  if (followerCount < 400)
    return "#1d4877"; // Blue
  else if (followerCount < 1000)
    return "#1b8a5a"; // green
  else if (followerCount < 10000)
    return "#fbb021"; // yellow
  else if (followerCount < 50000)
    return "#f68838"; // orange
  else return "#ee3e32"; // Red
}

// Size scale function based on follower count
function getSizeForFollowerCount(followerCount: number) {
  if (followerCount < 400) return 100;
  else if (followerCount < 1000) return 150;
  else if (followerCount < 10000) return 200;
  else if (followerCount < 50000) return 250;
  else return 300;
}

export function createBubbleChart(data: IFollower[], container: HTMLElement) {
  const userNode = {
    data: { id: "userNode", label: "User" }, // Central user node
  };

  const followerNodes = data.map((follower, index) => ({
    data: {
      id: follower.profileName || `follower_${index}`,
      label: `${follower.profileName} (${follower.followerCount})`,
      followerCount: follower.followerCount,
    },
    style: {
      "background-color": getColorForFollowerCount(follower.followerCount),
      width: getSizeForFollowerCount(follower.followerCount),
      height: getSizeForFollowerCount(follower.followerCount),
    },
  }));

  // Create edges connecting each follower to the central user node
  const edges = data.map((follower, index) => ({
    data: {
      id: `edge_${index}`,
      source: "userNode", // Source is the central user node
      target: follower.profileName || `follower_${index}`, // Target is each follower node
    },
  }));

  const cy = cytoscape({
    container, // container to render in
    elements: [userNode, ...followerNodes, ...edges], // Combine user node, follower nodes, and edges into one array
    // elements: followerNodes,
    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          width: "mapData(followerCount, 0, 2000, 20, 60)",
          height: "mapData(followerCount, 0, 2000, 20, 60)",
          "font-size": "24px",
          "text-max-width": "80%",
          //   @ts-ignore
          padding: "10px",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
    ],
    headless: false,
    layout: {
      name: "cola",
      //   @ts-ignore
      fit: true,
      padding: 10,
    },

    //   userZoomingEnabled: false
  });
  cy.stop();
}
