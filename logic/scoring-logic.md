# Scoring Logic

We will calculate shot outcomes using a matrix of potential scoring points rather than relying on visual image transparency alone.

## Goal Scoring Matrix

The first layer is the net itself. We need to define the pixels or coordinate points inside the net where a shot counts as a goal. These points become the valid scoring target area.

The original goal image dimensions are 1536w by 1024h.

The goal tally area over the goal image is defined by four corner points:

- Top left: 190px w by 140px h, which is 12.37% of the goal image width by 13.67% of the goal image height.
- Top right: 1346px w by 140px h, which is 87.63% of the goal image width by 13.67% of the goal image height.
- Bottom left: 190px w by 870px h, which is 12.37% of the goal image width by 84.96% of the goal image height.
- Bottom right: 1346px w by 870px h, which is 87.63% of the goal image width by 84.96% of the goal image height.

Secretly, the scoring calculation will use the horizontal position of the shooter plus the user's aim location to determine whether the shot lands inside the goal tally zone. The game does not need to rely on the visible puck sprite alone for scoring.

Once we calculate the intended landing point in the goal tally zone, we can quantize that value into a discrete shot lane or ray. That ray can then drive the puck animation, so the visual shot follows the same scoring decision that was already calculated.

## Goalie Scoring Holes

Next, we need to identify five scoring areas on the goalie image. These represent the five holes where a puck can beat the goalie:

- Upper left
- Upper right
- Lower left
- Lower right
- Five-hole

We will need a reliable way to map those five areas onto the goalie image so the shot calculation can determine whether the puck path lands in one of those openings.

## Goalie Movement Interception

Finally, the calculation must consider the goalie moving in real time. For each shot, we need to compare:

- The puck path and target point
- The goalie position at shot start
- The immediate goalie movement after the shot
- Whether the goalie moves far enough, fast enough, to intercept the puck

The result should determine whether the puck scores, hits a covered goalie area, or is intercepted by goalie movement before reaching the net.
