import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

// LMS法による成長標準値データ（日本小児内分泌学会論文Table 2, Table 3より）
const generateGrowthStandards = () => {
  const standards = { male: { height: [], weight: [] }, female: { height: [], weight: [] } };
  
  const maleHeightLMS = [
    {age: 0, L: 2.300, M: 49.0, S: 0.0417}, {age: 0.25, L: 2.212, M: 61.5, S: 0.0378}, {age: 0.5, L: 2.124, M: 67.7, S: 0.0351}, {age: 0.75, L: 2.036, M: 71.6, S: 0.0335}, {age: 1, L: 1.948, M: 74.8, S: 0.0328}, {age: 1.25, L: 1.861, M: 77.8, S: 0.0328}, {age: 1.5, L: 1.773, M: 80.7, S: 0.0332}, {age: 1.75, L: 1.685, M: 83.4, S: 0.0340}, {age: 2, L: 1.597, M: 85.8, S: 0.0348}, {age: 2.5, L: 1.421, M: 89.7, S: 0.0364}, {age: 3, L: 1.245, M: 93.5, S: 0.0378}, {age: 3.5, L: 1.069, M: 97.1, S: 0.0386}, {age: 4, L: 0.894, M: 100.4, S: 0.0392}, {age: 4.5, L: 0.718, M: 103.6, S: 0.0397}, {age: 5, L: 0.542, M: 106.8, S: 0.0403}, {age: 5.5, L: 0.366, M: 110.1, S: 0.0410}, {age: 6, L: 0.190, M: 113.3, S: 0.0417}, {age: 6.5, L: 0.015, M: 116.4, S: 0.0423}, {age: 7, L: -0.161, M: 119.5, S: 0.0426}, {age: 7.5, L: -0.337, M: 122.4, S: 0.0426}, {age: 8, L: -0.513, M: 125.1, S: 0.0424}, {age: 8.5, L: -0.689, M: 127.8, S: 0.0421}, {age: 9, L: -0.864, M: 130.4, S: 0.0420}, {age: 9.5, L: -1.040, M: 133.1, S: 0.0424}, {age: 10, L: -1.216, M: 135.9, S: 0.0435}, {age: 10.5, L: -1.392, M: 138.8, S: 0.0453}, {age: 11, L: -1.401, M: 142.0, S: 0.0476}, {age: 11.5, L: -0.965, M: 145.4, S: 0.0500}, {age: 12, L: -0.275, M: 149.0, S: 0.0519}, {age: 12.5, L: 0.428, M: 153.1, S: 0.0526}, {age: 13, L: 0.931, M: 157.0, S: 0.0517}, {age: 13.5, L: 1.090, M: 160.5, S: 0.0491}, {age: 14, L: 0.865, M: 163.4, S: 0.0453}, {age: 14.5, L: 0.323, M: 165.6, S: 0.0414}, {age: 15, L: -0.370, M: 167.3, S: 0.0382}, {age: 15.5, L: -0.982, M: 168.6, S: 0.0358}, {age: 16, L: -1.267, M: 169.5, S: 0.0344}, {age: 16.5, L: -1.031, M: 170.1, S: 0.0340}, {age: 17, L: -0.516, M: 170.5, S: 0.0340}, {age: 17.5, L: 0.000, M: 170.8, S: 0.0340}
  ];
  const femaleHeightLMS = [
    {age: 0, L: 1.200, M: 48.5, S: 0.0390}, {age: 0.25, L: 1.159, M: 60.1, S: 0.0361}, {age: 0.5, L: 1.117, M: 66.2, S: 0.0341}, {age: 0.75, L: 1.076, M: 70.2, S: 0.0327}, {age: 1, L: 1.034, M: 73.5, S: 0.0318}, {age: 1.25, L: 0.993, M: 76.6, S: 0.0316}, {age: 1.5, L: 0.952, M: 79.5, S: 0.0317}, {age: 1.75, L: 0.910, M: 82.2, S: 0.0321}, {age: 2, L: 0.869, M: 84.6, S: 0.0328}, {age: 2.5, L: 0.786, M: 88.4, S: 0.0344}, {age: 3, L: 0.703, M: 91.8, S: 0.0361}, {age: 3.5, L: 0.620, M: 95.4, S: 0.0376}, {age: 4, L: 0.538, M: 99.4, S: 0.0389}, {age: 4.5, L: 0.455, M: 103.2, S: 0.0399}, {age: 5, L: 0.372, M: 106.7, S: 0.0406}, {age: 5.5, L: 0.289, M: 109.7, S: 0.0411}, {age: 6, L: 0.206, M: 112.7, S: 0.0414}, {age: 6.5, L: 0.124, M: 115.5, S: 0.0416}, {age: 7, L: 0.041, M: 118.3, S: 0.0418}, {age: 7.5, L: -0.042, M: 121.2, S: 0.0421}, {age: 8, L: -0.114, M: 124.1, S: 0.0428}, {age: 8.5, L: -0.036, M: 127.2, S: 0.0438}, {age: 9, L: 0.213, M: 130.4, S: 0.0451}, {age: 9.5, L: 0.599, M: 133.8, S: 0.0466}, {age: 10, L: 1.055, M: 137.2, S: 0.0477}, {age: 10.5, L: 1.506, M: 140.6, S: 0.0481}, {age: 11, L: 1.879, M: 144.0, S: 0.0472}, {age: 11.5, L: 2.118, M: 147.2, S: 0.0447}, {age: 12, L: 2.190, M: 150.0, S: 0.0410}, {age: 12.5, L: 2.090, M: 152.1, S: 0.0367}, {age: 13, L: 1.843, M: 153.8, S: 0.0342}, {age: 13.5, L: 1.498, M: 155.1, S: 0.0324}, {age: 14, L: 1.124, M: 155.9, S: 0.0314}, {age: 14.5, L: 0.801, M: 156.6, S: 0.0310}, {age: 15, L: 0.602, M: 157.0, S: 0.0310}, {age: 15.5, L: 0.579, M: 157.3, S: 0.0310}, {age: 16, L: 0.742, M: 157.5, S: 0.0310}, {age: 16.5, L: 1.032, M: 157.7, S: 0.0310}, {age: 17, L: 1.295, M: 157.8, S: 0.0310}, {age: 17.5, L: 1.250, M: 157.8, S: 0.0310}
  ];
  const maleWeightLMS = [
    {age: 0, L: 0.774, M: 3.00, S: 0.149}, {age: 0.25, L: 0.490, M: 6.31, S: 0.131}, {age: 0.5, L: 0.262, M: 7.93, S: 0.119}, {age: 0.75, L: 0.082, M: 8.80, S: 0.110}, {age: 1, L: -0.062, M: 9.38, S: 0.105}, {age: 1.25, L: -0.177, M: 9.91, S: 0.102}, {age: 1.5, L: -0.269, M: 10.4, S: 0.101}, {age: 1.75, L: -0.344, M: 11.0, S: 0.102}, {age: 2, L: -0.408, M: 11.5, S: 0.103}, {age: 2.5, L: -0.513, M: 12.5, S: 0.108}, {age: 3, L: -0.607, M: 13.5, S: 0.113}, {age: 3.5, L: -0.703, M: 14.5, S: 0.119}, {age: 4, L: -0.804, M: 15.5, S: 0.123}, {age: 4.5, L: -0.913, M: 16.5, S: 0.127}, {age: 5, L: -1.026, M: 17.5, S: 0.131}, {age: 5.5, L: -1.136, M: 18.5, S: 0.134}, {age: 6, L: -1.236, M: 19.6, S: 0.138}, {age: 6.5, L: -1.321, M: 20.9, S: 0.142}, {age: 7, L: -1.384, M: 22.2, S: 0.146}, {age: 7.5, L: -1.420, M: 23.5, S: 0.152}, {age: 8, L: -1.429, M: 25.0, S: 0.159}, {age: 8.5, L: -1.407, M: 26.4, S: 0.166}, {age: 9, L: -1.358, M: 28.0, S: 0.174}, {age: 9.5, L: -1.284, M: 29.6, S: 0.182}, {age: 10, L: -1.191, M: 31.4, S: 0.189}, {age: 10.5, L: -1.084, M: 33.4, S: 0.195}, {age: 11, L: -0.971, M: 35.6, S: 0.200}, {age: 11.5, L: -0.862, M: 38.1, S: 0.204}, {age: 12, L: -0.764, M: 40.7, S: 0.206}, {age: 12.5, L: -0.686, M: 43.6, S: 0.205}, {age: 13, L: -0.636, M: 46.3, S: 0.201}, {age: 13.5, L: -0.619, M: 49.0, S: 0.196}, {age: 14, L: -0.642, M: 51.6, S: 0.187}, {age: 14.5, L: -0.705, M: 54.0, S: 0.178}, {age: 15, L: -0.809, M: 55.9, S: 0.169}, {age: 15.5, L: -0.952, M: 57.5, S: 0.161}, {age: 16, L: -1.127, M: 58.8, S: 0.155}, {age: 16.5, L: -1.325, M: 59.7, S: 0.151}, {age: 17, L: -1.534, M: 60.4, S: 0.147}, {age: 17.5, L: -1.739, M: 60.9, S: 0.141}
  ];
  const femaleWeightLMS = [
    {age: 0, L: 0.754, M: 2.95, S: 0.146}, {age: 0.25, L: 0.375, M: 5.86, S: 0.126}, {age: 0.5, L: 0.083, M: 7.32, S: 0.113}, {age: 0.75, L: -0.139, M: 8.14, S: 0.106}, {age: 1, L: -0.303, M: 8.72, S: 0.103}, {age: 1.25, L: -0.422, M: 9.26, S: 0.102}, {age: 1.5, L: -0.506, M: 9.82, S: 0.102}, {age: 1.75, L: -0.563, M: 10.4, S: 0.104}, {age: 2, L: -0.602, M: 11.0, S: 0.105}, {age: 2.5, L: -0.646, M: 12.1, S: 0.110}, {age: 3, L: -0.677, M: 13.1, S: 0.114}, {age: 3.5, L: -0.718, M: 14.0, S: 0.118}, {age: 4, L: -0.778, M: 15.1, S: 0.122}, {age: 4.5, L: -0.861, M: 16.1, S: 0.127}, {age: 5, L: -0.960, M: 17.1, S: 0.131}, {age: 5.5, L: -1.068, M: 18.2, S: 0.137}, {age: 6, L: -1.171, M: 19.4, S: 0.142}, {age: 6.5, L: -1.259, M: 20.6, S: 0.148}, {age: 7, L: -1.319, M: 21.9, S: 0.154}, {age: 7.5, L: -1.344, M: 23.2, S: 0.159}, {age: 8, L: -1.328, M: 24.5, S: 0.164}, {age: 8.5, L: -1.269, M: 25.9, S: 0.169}, {age: 9, L: -1.169, M: 27.4, S: 0.174}, {age: 9.5, L: -1.037, M: 29.2, S: 0.180}, {age: 10, L: -0.884, M: 31.2, S: 0.185}, {age: 10.5, L: -0.722, M: 33.6, S: 0.190}, {age: 11, L: -0.572, M: 36.3, S: 0.194}, {age: 11.5, L: -0.448, M: 39.0, S: 0.195}, {age: 12, L: -0.368, M: 41.5, S: 0.194}, {age: 12.5, L: -0.346, M: 43.8, S: 0.187}, {age: 13, L: -0.389, M: 45.8, S: 0.176}, {age: 13.5, L: -0.496, M: 47.5, S: 0.164}, {age: 14, L: -0.653, M: 48.8, S: 0.154}, {age: 14.5, L: -0.830, M: 49.8, S: 0.147}, {age: 15, L: -0.976, M: 50.6, S: 0.142}, {age: 15.5, L: -1.012, M: 51.2, S: 0.139}, {age: 16, L: -1.072, M: 51.6, S: 0.138}, {age: 16.5, L: -1.132, M: 51.9, S: 0.137}, {age: 17, L: -1.192, M: 52.1, S: 0.135}, {age: 17.5, L: -1.252, M: 52.3, S: 0.134}
  ];

  standards.male.height = maleHeightLMS;
  standards.male.weight = maleWeightLMS;
  standards.female.height = femaleHeightLMS;
  standards.female.weight = femaleWeightLMS;
  
  return standards;
};

const growthStandards = generateGrowthStandards();

const calculateSDValue = (y, L, M, S, sd) => {
  if (L === 0) {
    return M * Math.exp(S * sd);
  } else {
    return M * Math.pow(1 + L * S * sd, 1 / L);
  }
};

const calculateSDScore = (value, age, gender, measurementType) => {
  const standards = growthStandards[gender][measurementType];
  
  let closestIndex = 0;
  let minDiff = Math.abs(standards[0].age - age);
  
  for (let i = 1; i < standards.length; i++) {
    const diff = Math.abs(standards[i].age - age);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  let L, M, S;
  if (closestIndex === 0 || closestIndex === standards.length - 1 || standards[closestIndex].age === age) {
    L = standards[closestIndex].L;
    M = standards[closestIndex].M;
    S = standards[closestIndex].S;
  } else {
    const i = age < standards[closestIndex].age ? closestIndex - 1 : closestIndex;
    if (i >= 0 && i < standards.length - 1) {
      const fraction = (age - standards[i].age) / (standards[i + 1].age - standards[i].age);
      L = standards[i].L + fraction * (standards[i + 1].L - standards[i].L);
      M = standards[i].M + fraction * (standards[i + 1].M - standards[i].M);
      S = standards[i].S + fraction * (standards[i + 1].S - standards[i].S);
    } else {
      L = standards[closestIndex].L;
      M = standards[closestIndex].M;
      S = standards[closestIndex].S;
    }
  }
  
  let z;
  if (L === 0) {
    z = Math.log(value / M) / S;
  } else {
    z = (Math.pow(value / M, L) - 1) / (L * S);
  }
  
  return Math.round(z * 10) / 10;
};

function CombinedGrowthChart({ measurements, gender, childName, patientId }) {
    const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 60, right: 100, bottom: 100, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 1100 - margin.top - margin.bottom;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();
    svgElement.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    svgElement.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", "white");
    const g = svgElement.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    g.append("rect").attr("width", width).attr("height", height).attr("fill", "white").attr("stroke", "black").attr("stroke-width", 1.5);

    const xScale = d3.scaleLinear().domain([0, 18]).range([0, width]);
    const yScaleHeight = d3.scaleLinear().domain([30, 190]).range([height, 0]);
    const weightBottom = yScaleHeight(30);
    const weightAt90kg = yScaleHeight(120);
    const yScaleWeight = d3.scaleLinear().domain([0, 90, 110]).range([weightBottom, weightAt90kg, yScaleHeight(140)]);

    for (let age = 0; age <= 18; age += 2) { g.append("line").attr("x1", xScale(age)).attr("x2", xScale(age)).attr("y1", 0).attr("y2", height).attr("stroke", "#999").attr("stroke-width", 0.5); }
    for (let age = 1; age <= 17; age += 2) { g.append("line").attr("x1", xScale(age)).attr("x2", xScale(age)).attr("y1", 0).attr("y2", height).attr("stroke", "#ddd").attr("stroke-width", 0.3); }
    for (let h = 30; h <= 190; h += 10) { g.append("line").attr("x1", 0).attr("x2", width).attr("y1", yScaleHeight(h)).attr("y2", yScaleHeight(h)).attr("stroke", h % 20 === 0 ? "#999" : "#ddd").attr("stroke-width", h % 20 === 0 ? 0.5 : 0.3); }

    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale).ticks(18)).style("font-size", "12px");
    g.append("text").attr("x", width / 2).attr("y", height + 45).attr("fill", "black").style("text-anchor", "middle").style("font-size", "14px").style("font-weight", "bold").text("AGE (years)");
    g.append("g").call(d3.axisLeft(yScaleHeight).tickValues(d3.range(30, 200, 10))).style("font-size", "12px");
    g.append("text").attr("transform", "rotate(-90)").attr("y", -60).attr("x", -height / 2).attr("fill", "black").style("text-anchor", "middle").style("font-size", "14px").style("font-weight", "bold").text("LENGTH / HEIGHT (cm)");

    const weightAxis = g.append("g").attr("transform", `translate(${width}, 0)`);
    const weightTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
    weightAxis.selectAll(".weight-tick").data(weightTicks).enter().append("g").attr("class", "weight-tick").attr("transform", d => `translate(0, ${yScaleWeight(d)})`).each(function (d) { d3.select(this).append("line").attr("x1", 0).attr("x2", 6).attr("stroke", "black"); d3.select(this).append("text").attr("x", 9).attr("y", 3).style("font-size", "12px").style("text-anchor", "start").text(d); });
    g.append("text").attr("transform", "rotate(90)").attr("y", -width - 80).attr("x", height / 2).attr("fill", "black").style("text-anchor", "middle").style("font-size", "14px").style("font-weight", "bold").text("WEIGHT (kg)");

    const lineHeight = d3.line().x(d => xScale(d.age)).y(d => yScaleHeight(d.value)).curve(d3.curveMonotoneX);
    const lineWeight = d3.line().x(d => xScale(d.age)).y(d => yScaleWeight(d.value)).curve(d3.curveMonotoneX);

    const heightStandards = growthStandards[gender].height;
    const sdLevelsHeight = [3, 2, 1, 0, -1, -2, -2.5, -3];
    const ageToIndex = d3.scaleLinear().domain(heightStandards.map(d => d.age)).range(heightStandards.map((d, i) => i));
    sdLevelsHeight.forEach(sd => {
        const data = [];
        for (let age = 0; age <= 17.5; age += 0.1) {
            const index = ageToIndex(age);
            const i = Math.floor(index);
            const fraction = index - i;
            if (i >= 0 && i < heightStandards.length - 1) {
                const L = heightStandards[i].L + fraction * (heightStandards[i + 1].L - heightStandards[i].L);
                const M = heightStandards[i].M + fraction * (heightStandards[i + 1].M - heightStandards[i].M);
                const S = heightStandards[i].S + fraction * (heightStandards[i + 1].S - heightStandards[i].S);
                const value = calculateSDValue(null, L, M, S, sd);
                data.push({ age, value });
            } else if (i === heightStandards.length - 1) {
                const { L, M, S } = heightStandards[i];
                const value = calculateSDValue(null, L, M, S, sd);
                data.push({ age, value });
            }
        }
        let strokeColor = "#0066cc", strokeWidth = 1, strokeDash = "";
        if (sd === 0) strokeWidth = 2;
        else if (sd === -2.5) strokeDash = "5,5";
        g.append("path").datum(data).attr("fill", "none").attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("stroke-dasharray", strokeDash).attr("d", lineHeight);
        const lastPoint = data[data.length - 1];
        if (lastPoint && lastPoint.value >= 30 && lastPoint.value <= 190) {
            g.append("text").attr("x", xScale(17.5) + 5).attr("y", yScaleHeight(lastPoint.value)).attr("fill", strokeColor).style("font-size", "10px").style("font-weight", "bold").text(`${sd > 0 ? '+' : ''}${sd}SD`);
        }
    });

    const weightStandards = growthStandards[gender].weight;
    const sdLevelsWeight = [2, 1, 0, -1, -2];
    const ageToIndexWeight = d3.scaleLinear().domain(weightStandards.map(d => d.age)).range(weightStandards.map((d, i) => i));
    sdLevelsWeight.forEach(sd => {
        const data = [];
        for (let age = 0; age <= 17.5; age += 0.1) {
            const index = ageToIndexWeight(age);
            const i = Math.floor(index);
            const fraction = index - i;
            if (i >= 0 && i < weightStandards.length - 1) {
                const L = weightStandards[i].L + fraction * (weightStandards[i + 1].L - weightStandards[i].L);
                const M = weightStandards[i].M + fraction * (weightStandards[i + 1].M - weightStandards[i].M);
                const S = weightStandards[i].S + fraction * (weightStandards[i + 1].S - weightStandards[i].S);
                const value = calculateSDValue(null, L, M, S, sd);
                data.push({ age, value });
            } else if (i === weightStandards.length - 1) {
                const { L, M, S } = weightStandards[i];
                const value = calculateSDValue(null, L, M, S, sd);
                data.push({ age, value });
            }
        }
        let strokeColor = "#0066cc", strokeWidth = 1;
        if (sd === 0) strokeWidth = 2;
        g.append("path").datum(data).attr("fill", "none").attr("stroke", strokeColor).attr("stroke-width", strokeWidth).attr("d", lineWeight);
        const lastPoint = data[data.length - 1];
        if (lastPoint && lastPoint.value >= 0 && lastPoint.value <= 110) {
            g.append("text").attr("x", width + 35).attr("y", yScaleWeight(lastPoint.value)).attr("fill", strokeColor).style("font-size", "10px").style("font-weight", "bold").text(`${sd > 0 ? '+' : ''}${sd}SD`);
        }
    });

    g.append("text").attr("x", width / 2).attr("y", -35).attr("text-anchor", "middle").style("font-size", "20px").style("font-weight", "bold").style("fill", "#0066cc").text(`Cross-sectional Growth Chart for ${gender === 'male' ? 'Boys' : 'Girls'} (0-18 yrs)`);
    g.append("text").attr("x", width / 2).attr("y", -15).attr("text-anchor", "middle").style("font-size", "12px").text("(The 2000 National Growth Survey on Preschool Children & School Health Statistics Research)");
    g.append("text").attr("x", 10).attr("y", 20).style("font-size", "14px").style("font-weight", "bold").text(`患者ID: ${patientId} / 名前: ${childName}`);
    g.append("text").attr("x", width / 2).attr("y", yScaleHeight(140)).attr("text-anchor", "middle").style("font-size", "16px").style("font-weight", "bold").style("fill", "#333").text("LENGTH / HEIGHT");
    g.append("text").attr("x", width / 2).attr("y", yScaleHeight(70)).attr("text-anchor", "middle").style("font-size", "16px").style("font-weight", "bold").style("fill", "#333").text("WEIGHT");

    if (measurements && measurements.length > 0) {
        const heightData = measurements.map(m => ({ age: m.age, value: m.height })).sort((a, b) => a.age - b.age);
        g.append("path").datum(heightData).attr("fill", "none").attr("stroke", "#ff0000").attr("stroke-width", 2).attr("d", lineHeight);
        g.selectAll(".height-dot").data(heightData).enter().append("circle").attr("cx", d => xScale(d.age)).attr("cy", d => yScaleHeight(d.value)).attr("r", 4).attr("fill", "#ff0000").attr("stroke", "#ff0000").attr("stroke-width", 1);
        const weightData = measurements.map(m => ({ age: m.age, value: m.weight })).sort((a, b) => a.age - b.age);
        g.append("path").datum(weightData).attr("fill", "none").attr("stroke", "#ff0000").attr("stroke-width", 2).attr("d", lineWeight);
        g.selectAll(".weight-dot").data(weightData).enter().append("circle").attr("cx", d => xScale(d.age)).attr("cy", d => yScaleWeight(d.value)).attr("r", 4).attr("fill", "#ff0000").attr("stroke", "#ff0000").attr("stroke-width", 1);
    }

    g.append("text").attr("x", 10).attr("y", height - 40).style("font-size", "10px").style("fill", "#666").text("The dotted lines of the -2.5 SD and -3.0 SD indicate the criteria for starting growth hormone (GH) treatment for");
    g.append("text").attr("x", 10).attr("y", height - 25).style("font-size", "10px").style("fill", "#666").text("GH deficiency and achondroplasia, respectively, which are included in the Japanese Medical Aid Program for");
    g.append("text").attr("x", 10).attr("y", height - 10).style("font-size", "10px").style("fill", "#666").text("Specific Pediatric Chronic Diseases.");
    g.append("text").attr("x", 10).attr("y", height + 70).style("font-size", "9px").style("fill", "#999").text("© The Japanese Society for Pediatric Endocrinology");

  }, [measurements, gender, childName, patientId]);

  return <svg ref={svgRef} style={{ backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}></svg>;
}

function App() {
  const [childInfo, setChildInfo] = useState({ patientId: '', fullName: '', birthDate: '', gender: 'male' });
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState({ date: new Date().toISOString().split('T')[0], height: '', weight: '' });

  const updateMeasurementsWithSD = (measurementsList, gender) => {
    return measurementsList.map(m => {
      if (typeof m.age === 'undefined') { return m; }
      const heightSD = calculateSDScore(m.height, m.age, gender, 'height');
      const weightSD = calculateSDScore(m.weight, m.age, gender, 'weight');
      return { ...m, heightSD, weightSD };
    });
  };

  useEffect(() => {
    if (measurements.length > 0) {
      setMeasurements(prevMeasurements => updateMeasurementsWithSD(prevMeasurements, childInfo.gender));
    }
  }, [childInfo.gender]);

  const handleChildInfoChange = (e) => { const { name, value } = e.target; setChildInfo(prev => ({ ...prev, [name]: value })); };
  const handleMeasurementChange = (e) => { const { name, value } = e.target; setCurrentMeasurement(prev => ({ ...prev, [name]: value })); };
  const calculateAge = (birthDate, measurementDate) => { const birth = new Date(birthDate); const measurement = new Date(measurementDate); const ageInMonths = (measurement - birth) / (1000 * 60 * 60 * 24 * 30.44); return ageInMonths / 12; };

  const addMeasurement = () => {
    if (!childInfo.birthDate || !currentMeasurement.height || !currentMeasurement.weight) { alert('必要な情報を全て入力してください'); return; }
    const age = calculateAge(childInfo.birthDate, currentMeasurement.date);
    if (age < 0 || age > 18) { alert('年齢が0-18歳の範囲外です'); return; }
    const height = parseFloat(currentMeasurement.height);
    const weight = parseFloat(currentMeasurement.weight);
    const heightSD = calculateSDScore(height, age, childInfo.gender, 'height');
    const weightSD = calculateSDScore(weight, age, childInfo.gender, 'weight');
    const newMeasurement = { ...currentMeasurement, age, height, weight, heightSD, weightSD };
    setMeasurements([...measurements, newMeasurement]);
    setCurrentMeasurement({ date: new Date().toISOString().split('T')[0], height: '', weight: '' });
  };

  const deleteMeasurement = (index) => { if (window.confirm('この記録を削除してもよろしいですか？')) { const newMeasurements = [...measurements]; newMeasurements.splice(index, 1); setMeasurements(newMeasurements); } };

  const downloadChart = () => {
    const svgElement = document.querySelector('svg');
    if (!svgElement) { alert('グラフが見つかりません。'); return; }
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `成長曲線_${childInfo.patientId || '0'}_${childInfo.fullName}_${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">お子様の成長記録</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">お子様の情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">患者ID（不明な場合は0）</label><input type="text" name="patientId" value={childInfo.patientId} onChange={handleChildInfoChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">お名前（フルネーム）</label><input type="text" name="fullName" value={childInfo.fullName} onChange={handleChildInfoChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="山田太郎" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label><input type="date" name="birthDate" value={childInfo.birthDate} onChange={handleChildInfoChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">性別</label><select name="gender" value={childInfo.gender} onChange={handleChildInfoChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="male">男の子</option><option value="female">女の子</option></select></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">測定値の入力</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">測定日</label><input type="date" name="date" value={currentMeasurement.date} onChange={handleMeasurementChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label><input type="number" name="height" value={currentMeasurement.height} onChange={handleMeasurementChange} step="0.1" min="30" max="190" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100.5" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label><input type="number" name="weight" value={currentMeasurement.weight} onChange={handleMeasurementChange} step="0.1" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="15.5" /></div>
            <div className="flex items-end"><button onClick={addMeasurement} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">記録を追加</button></div>
          </div>
        </div>
        {measurements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">記録履歴</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">測定日</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">身長 (cm)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">身長SD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">体重 (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">体重SD</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {measurements.map((m, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.age.toFixed(1)}歳</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.height}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className={`font-medium ${m.heightSD >= -2 && m.heightSD <= 2 ? 'text-green-600' : m.heightSD < -2.5 || m.heightSD > 2.5 ? 'text-red-600' : 'text-yellow-600'}`}>{m.heightSD > 0 ? '+' : ''}{m.heightSD} SD</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.weight}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className={`font-medium ${m.weightSD >= -2 && m.weightSD <= 2 ? 'text-green-600' : m.weightSD < -2 || m.weightSD > 2 ? 'text-red-600' : 'text-yellow-600'}`}>{m.weightSD > 0 ? '+' : ''}{m.weightSD} SD</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-center"><button onClick={() => deleteMeasurement(index)} className="text-red-600 hover:text-red-800 font-medium text-sm" title="削除">削除</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {childInfo.birthDate && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">成長曲線</h2>
              <button onClick={downloadChart} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">グラフをダウンロード</button>
            </div>
            <div className="overflow-x-auto flex justify-center">
              <CombinedGrowthChart measurements={measurements} gender={childInfo.gender} childName={childInfo.fullName} patientId={childInfo.patientId || '0'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;