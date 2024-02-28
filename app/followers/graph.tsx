"use client"
import React, { useEffect } from 'react';
import { IFollower } from '@/types/followers';
import { useRef } from 'react';
import { createBubbleChart } from '@/middleware/caststats/generate-chart';

// Assuming IFollower is defined and imported along with createBubbleChart
interface IProps {
    followers: IFollower[];
}
const GraphComponent = (props: IProps) => {

    const container = useRef(null);

    useEffect(() => {
    // Ensure the DOM element is available and call the function to create the graph
    if (container.current) createBubbleChart(props.followers, container.current);
  }, [container]);

  return (
    <div>
    <div id="cy" ref={container} style={{ width: '100%', height: '600px' }} className='border'>
      {/* Cytoscape graph will be inserted here */}
    </div>
    </div>
  );
};

export default GraphComponent;
