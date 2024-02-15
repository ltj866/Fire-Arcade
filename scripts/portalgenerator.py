import random
"""
Input: list of possible portal areas
Output: List of tuples where portals should be made
"""
#random.seed(1)

areas = ["A","B","C","D","E","F","G","H"]
random.shuffle(areas)

portals = []

start = areas.pop() # Start with a random area

while len(areas) > 0: # Connect to a different random area
    end = areas.pop()
    portals.append((start,end))
    start = end 
  
# Connect first and last area as a special case
portals.append((portals[0][0], portals[-1][-1]))
