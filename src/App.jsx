import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

// 標準体重計算式（日本小児内分泌学会の公式に基づく）
const calculateStandardWeight = (height, age, gender) => {
  if (gender === 'male') {
    // 男児
    if (age < 6 && height >= 70 && height < 120) {
      // 幼児期
      return 0.00206 * height * height - 0.1166 * height + 6.5273;
    } else if (age >= 6 && height >= 101 && height < 140) {
      // 学童期 (101-140cm)
      return 0.0000303882 * Math.pow(height, 3) - 0.00571495 * height * height + 0.508124 * height - 9.17791;
    } else if (age >= 6 && height >= 140 && height < 149) {
      // 学童期 (140-149cm)
      return -0.000085013 * Math.pow(height, 3) + 0.0370692 * height * height - 4.6558 * height + 191.847;
    } else if (age >= 6 && height >= 149 && height < 184) {
      // 学童期 (149-184cm)
      return -0.000310205 * Math.pow(height, 3) + 0.151159 * height * height - 23.6303 * height + 1231.04;
    }
  } else {
    // 女児
    if (age < 6 && height >= 70 && height < 120) {
      // 幼児期
      return 0.00249 * height * height - 0.1858 * height + 9.0360;
    } else if (age >= 6 && height >= 101 && height < 140) {
      // 学童期 (101-140cm)
      return 0.000127719 * Math.pow(height, 3) - 0.0414712 * height * height + 4.8575 * height - 184.492;
    } else if (age >= 6 && height >= 140 && height < 149) {
      // 学童期 (140-149cm)
      return -0.00178766 * Math.pow(height, 3) + 0.803922 * height * height - 119.31 * height + 5885.03;
    } else if (age >= 6 && height >= 149 && height < 171) {
      // 学童期 (149-171cm)
      return 0.000956401 * Math.pow(height, 3) - 0.462755 * height * height + 75.3058 * height - 4068.31;
    }
  }
  // デフォルト値
  return 0;
};

// 肥満度計算
const calculateObesityDegree = (actualWeight, standardWeight) => {
  return ((actualWeight - standardWeight) / standardWeight) * 100;
};

// 成長標準値データ（日本小児内分泌学会 2016年データに基づく近似値）
// LMS法による実際のデータに近い値を使用
const generateGrowthStandards = () => {
  const standards = { male: { height: [], weight: [] }, female: { height: [], weight: [] } };
  
  // 実際の成長曲線により近いデータ
  // 年齢ごとの平均値とSDを設定
  const maleHeightData = [
    {age: 0, mean: 49.89, sd: 2.11},
    {age: 0.5, mean: 67.29, sd: 2.29},
    {age: 1, mean: 75.58, sd: 2.83},
    {age: 1.5, mean: 81.11, sd: 3.16},
    {age: 2, mean: 85.60, sd: 3.42},
    {age: 2.5, mean: 89.52, sd: 3.64},
    {age: 3, mean: 93.08, sd: 3.85},
    {age: 3.5, mean: 96.37, sd: 4.04},
    {age: 4, mean: 99.51, sd: 4.23},
    {age: 4.5, mean: 102.54, sd: 4.41},
    {age: 5, mean: 105.51, sd: 4.58},
    {age: 5.5, mean: 108.43, sd: 4.76},
    {age: 6, mean: 111.31, sd: 4.93},
    {age: 6.5, mean: 114.15, sd: 5.11},
    {age: 7, mean: 116.96, sd: 5.28},
    {age: 7.5, mean: 119.75, sd: 5.46},
    {age: 8, mean: 122.52, sd: 5.64},
    {age: 8.5, mean: 125.27, sd: 5.82},
    {age: 9, mean: 128.00, sd: 6.00},
    {age: 9.5, mean: 130.72, sd: 6.19},
    {age: 10, mean: 133.43, sd: 6.38},
    {age: 10.5, mean: 136.14, sd: 6.57},
    {age: 11, mean: 138.85, sd: 6.77},
    {age: 11.5, mean: 141.58, sd: 6.98},
    {age: 12, mean: 144.34, sd: 7.19},
    {age: 12.5, mean: 147.17, sd: 7.41},
    {age: 13, mean: 150.08, sd: 7.64},
    {age: 13.5, mean: 153.10, sd: 7.86},
    {age: 14, mean: 156.24, sd: 8.06},
    {age: 14.5, mean: 159.47, sd: 8.22},
    {age: 15, mean: 162.74, sd: 8.32},
    {age: 15.5, mean: 165.95, sd: 8.34},
    {age: 16, mean: 168.97, sd: 8.29},
    {age: 16.5, mean: 171.69, sd: 8.17},
    {age: 17, mean: 173.99, sd: 8.00},
    {age: 17.5, mean: 175.77, sd: 7.80},
    {age: 18, mean: 177.00, sd: 7.59}
  ];

  const maleWeightData = [
    {age: 0, mean: 3.31, sd: 0.41},
    {age: 0.5, mean: 7.68, sd: 0.90},
    {age: 1, mean: 9.82, sd: 1.17},
    {age: 1.5, mean: 11.20, sd: 1.36},
    {age: 2, mean: 12.35, sd: 1.52},
    {age: 2.5, mean: 13.42, sd: 1.68},
    {age: 3, mean: 14.47, sd: 1.84},
    {age: 3.5, mean: 15.53, sd: 2.01},
    {age: 4, mean: 16.62, sd: 2.20},
    {age: 4.5, mean: 17.74, sd: 2.40},
    {age: 5, mean: 18.91, sd: 2.61},
    {age: 5.5, mean: 20.13, sd: 2.84},
    {age: 6, mean: 21.40, sd: 3.09},
    {age: 6.5, mean: 22.74, sd: 3.36},
    {age: 7, mean: 24.15, sd: 3.65},
    {age: 7.5, mean: 25.65, sd: 3.97},
    {age: 8, mean: 27.23, sd: 4.31},
    {age: 8.5, mean: 28.91, sd: 4.68},
    {age: 9, mean: 30.70, sd: 5.07},
    {age: 9.5, mean: 32.60, sd: 5.50},
    {age: 10, mean: 34.63, sd: 5.95},
    {age: 10.5, mean: 36.78, sd: 6.44},
    {age: 11, mean: 39.08, sd: 6.96},
    {age: 11.5, mean: 41.52, sd: 7.51},
    {age: 12, mean: 44.11, sd: 8.09},
    {age: 12.5, mean: 46.85, sd: 8.70},
    {age: 13, mean: 49.74, sd: 9.31},
    {age: 13.5, mean: 52.73, sd: 9.90},
    {age: 14, mean: 55.80, sd: 10.44},
    {age: 14.5, mean: 58.86, sd: 10.91},
    {age: 15, mean: 61.82, sd: 11.28},
    {age: 15.5, mean: 64.56, sd: 11.52},
    {age: 16, mean: 66.98, sd: 11.64},
    {age: 16.5, mean: 69.00, sd: 11.63},
    {age: 17, mean: 70.57, sd: 11.51},
    {age: 17.5, mean: 71.68, sd: 11.31},
    {age: 18, mean: 72.35, sd: 11.06}
  ];

  const femaleHeightData = [
    {age: 0, mean: 49.28, sd: 2.04},
    {age: 0.5, mean: 65.91, sd: 2.23},
    {age: 1, mean: 74.25, sd: 2.75},
    {age: 1.5, mean: 79.75, sd: 3.06},
    {age: 2, mean: 84.20, sd: 3.31},
    {age: 2.5, mean: 88.09, sd: 3.53},
    {age: 3, mean: 91.63, sd: 3.73},
    {age: 3.5, mean: 94.93, sd: 3.93},
    {age: 4, mean: 98.10, sd: 4.11},
    {age: 4.5, mean: 101.19, sd: 4.30},
    {age: 5, mean: 104.23, sd: 4.48},
    {age: 5.5, mean: 107.24, sd: 4.66},
    {age: 6, mean: 110.22, sd: 4.84},
    {age: 6.5, mean: 113.18, sd: 5.03},
    {age: 7, mean: 116.12, sd: 5.22},
    {age: 7.5, mean: 119.05, sd: 5.41},
    {age: 8, mean: 121.96, sd: 5.60},
    {age: 8.5, mean: 124.87, sd: 5.80},
    {age: 9, mean: 127.77, sd: 6.00},
    {age: 9.5, mean: 130.68, sd: 6.20},
    {age: 10, mean: 133.60, sd: 6.41},
    {age: 10.5, mean: 136.54, sd: 6.62},
    {age: 11, mean: 139.52, sd: 6.83},
    {age: 11.5, mean: 142.54, sd: 7.03},
    {age: 12, mean: 145.60, sd: 7.20},
    {age: 12.5, mean: 148.66, sd: 7.31},
    {age: 13, mean: 151.66, sd: 7.35},
    {age: 13.5, mean: 154.51, sd: 7.30},
    {age: 14, mean: 157.09, sd: 7.17},
    {age: 14.5, mean: 159.26, sd: 6.98},
    {age: 15, mean: 160.91, sd: 6.74},
    {age: 15.5, mean: 161.98, sd: 6.49},
    {age: 16, mean: 162.48, sd: 6.23},
    {age: 16.5, mean: 162.48, sd: 5.99},
    {age: 17, mean: 162.10, sd: 5.79},
    {age: 17.5, mean: 161.46, sd: 5.62},
    {age: 18, mean: 160.70, sd: 5.50}
  ];

  const femaleWeightData = [
    {age: 0, mean: 3.21, sd: 0.39},
    {age: 0.5, mean: 7.16, sd: 0.82},
    {age: 1, mean: 9.18, sd: 1.06},
    {age: 1.5, mean: 10.48, sd: 1.22},
    {age: 2, mean: 11.59, sd: 1.36},
    {age: 2.5, mean: 12.63, sd: 1.50},
    {age: 3, mean: 13.66, sd: 1.64},
    {age: 3.5, mean: 14.71, sd: 1.79},
    {age: 4, mean: 15.78, sd: 1.95},
    {age: 4.5, mean: 16.89, sd: 2.12},
    {age: 5, mean: 18.04, sd: 2.30},
    {age: 5.5, mean: 19.24, sd: 2.50},
    {age: 6, mean: 20.49, sd: 2.71},
    {age: 6.5, mean: 21.81, sd: 2.94},
    {age: 7, mean: 23.20, sd: 3.19},
    {age: 7.5, mean: 24.67, sd: 3.46},
    {age: 8, mean: 26.23, sd: 3.75},
    {age: 8.5, mean: 27.89, sd: 4.07},
    {age: 9, mean: 29.66, sd: 4.41},
    {age: 9.5, mean: 31.54, sd: 4.78},
    {age: 10, mean: 33.55, sd: 5.17},
    {age: 10.5, mean: 35.69, sd: 5.59},
    {age: 11, mean: 37.97, sd: 6.04},
    {age: 11.5, mean: 40.39, sd: 6.50},
    {age: 12, mean: 42.95, sd: 6.97},
    {age: 12.5, mean: 45.60, sd: 7.43},
    {age: 13, mean: 48.29, sd: 7.85},
    {age: 13.5, mean: 50.93, sd: 8.20},
    {age: 14, mean: 53.41, sd: 8.47},
    {age: 14.5, mean: 55.62, sd: 8.62},
    {age: 15, mean: 57.44, sd: 8.66},
    {age: 15.5, mean: 58.78, sd: 8.58},
    {age: 16, mean: 59.60, sd: 8.40},
    {age: 16.5, mean: 59.91, sd: 8.14},
    {age: 17, mean: 59.78, sd: 7.83},
    {age: 17.5, mean: 59.32, sd: 7.50},
    {age: 18, mean: 58.65, sd: 7.17}
  ];

  // データを格納
  maleHeightData.forEach(d => standards.male.height.push(d));
  maleWeightData.forEach(d => standards.male.weight.push(d));
  femaleHeightData.forEach(d => standards.female.height.push(d));
  femaleWeightData.forEach(d => standards.female.weight.push(d));
  
  return standards;
};

const growthStandards = generateGrowthStandards();

// 統合成長曲線グラフコンポーネント（医療用成長曲線スタイル）
function CombinedGrowthChart({ measurements, gender, childName, patientId }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 60, right: 100, bottom: 100, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 1100 - margin.top - margin.bottom;

    // 既存のSVGをクリア
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    // SVGのサイズ設定
    svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // 背景を白に
    svgElement.append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", "white");

    const g = svgElement.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // メイングリッドの背景
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);

    // スケール設定
    const xScale = d3.scaleLinear()
      .domain([0, 18])
      .range([0, width]);

    // 身長と体重のスケールを調整
    // 身長: 30-190cm を全体の高さにマッピング
    const yScaleHeight = d3.scaleLinear()
      .domain([30, 190])
      .range([height, 0]);

    // 体重: 0-110kg を調整して配置
    // 身長30cm = 体重0kg、身長120cm = 体重90kgになるように計算
    const weightBottom = yScaleHeight(30); // 身長30cmの位置 = 体重0kg
    const weightAt90kg = yScaleHeight(120); // 身長120cmの位置 = 体重90kg
    
    // 0-90kgまでは身長30-120cmの範囲に線形マッピング
    // 90-110kgは身長120cm以上の範囲に拡張
    const yScaleWeight = d3.scaleLinear()
      .domain([0, 90, 110])
      .range([weightBottom, weightAt90kg, yScaleHeight(140)]);

    // グリッドラインの追加
    // 主要な縦線（2歳ごと）
    for (let age = 0; age <= 18; age += 2) {
      g.append("line")
        .attr("x1", xScale(age))
        .attr("x2", xScale(age))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);
    }

    // 補助縦線（1歳ごと）
    for (let age = 1; age <= 17; age += 2) {
      g.append("line")
        .attr("x1", xScale(age))
        .attr("x2", xScale(age))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.3);
    }

    // 横線（身長用）
    for (let h = 30; h <= 190; h += 10) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScaleHeight(h))
        .attr("y2", yScaleHeight(h))
        .attr("stroke", h % 20 === 0 ? "#999" : "#ddd")
        .attr("stroke-width", h % 20 === 0 ? 0.5 : 0.3);
    }

    // 軸の描画
    // X軸（年齢）
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(18))
      .style("font-size", "12px");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("AGE (years)");

    // 左Y軸（身長）
    g.append("g")
      .call(d3.axisLeft(yScaleHeight).tickValues(d3.range(30, 200, 10)))
      .style("font-size", "12px");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("LENGTH / HEIGHT (cm)");

    // 右Y軸（体重）- カスタム軸
    const weightAxis = g.append("g")
      .attr("transform", `translate(${width}, 0)`);

    // 体重軸の目盛りを手動で追加
    const weightTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
    
    weightAxis.selectAll(".weight-tick")
      .data(weightTicks)
      .enter()
      .append("g")
      .attr("class", "weight-tick")
      .attr("transform", d => `translate(0, ${yScaleWeight(d)})`)
      .each(function(d) {
        d3.select(this).append("line")
          .attr("x1", 0)
          .attr("x2", 6)
          .attr("stroke", "black");
        d3.select(this).append("text")
          .attr("x", 9)
          .attr("y", 3)
          .style("font-size", "12px")
          .style("text-anchor", "start")
          .text(d);
      });

    // 右軸の延長線（90-100kg）は不要になったので削除

    g.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", width + 80)
      .attr("x", height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("WEIGHT (kg)");

    // ラインジェネレーター
    const lineHeight = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScaleHeight(d.value))
      .curve(d3.curveMonotoneX);

    const lineWeight = d3.line()
      .x(d => xScale(d.age))
      .y(d => yScaleWeight(d.value))
      .curve(d3.curveMonotoneX);

    // 身長の標準曲線を描画
    const heightStandards = growthStandards[gender].height;
    const sdLevelsHeight = [3, 2, 1, 0, -1, -2, -2.5, -3];
    
    sdLevelsHeight.forEach(sd => {
      const data = heightStandards.map(s => ({
        age: s.age,
        value: s.mean + sd * s.sd
      }));

      let strokeColor = "#0066cc";
      let strokeWidth = 1;
      let strokeDash = "";
      
      if (sd === 0) {
        strokeWidth = 2;
      } else if (sd === -2.5) {
        strokeDash = "5,5";
      }
      
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", strokeDash)
        .attr("d", lineHeight);

      // SDラベル（右側）
      const lastPoint = data[data.length - 1];
      if (lastPoint.value >= 30 && lastPoint.value <= 190) {
        g.append("text")
          .attr("x", xScale(18) + 5)
          .attr("y", yScaleHeight(lastPoint.value))
          .attr("fill", strokeColor)
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(`${sd > 0 ? '+' : ''}${sd}SD`);
      }
    });

    // 体重の標準曲線を描画
    const weightStandards = growthStandards[gender].weight;
    const sdLevelsWeight = [3, 2, 1, 0, -1, -2, -3];
    
    sdLevelsWeight.forEach(sd => {
      const data = weightStandards.map(s => ({
        age: s.age,
        value: s.mean + sd * s.sd
      }));

      let strokeColor = "#0066cc";
      let strokeWidth = 1;
      
      if (sd === 0) {
        strokeWidth = 2;
      }
      
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth)
        .attr("d", lineWeight);

      // SDラベル（右側）
      const lastPoint = data[data.length - 1];
      if (lastPoint.value >= 0 && lastPoint.value <= 110) {
        g.append("text")
          .attr("x", width + 35)
          .attr("y", yScaleWeight(lastPoint.value))
          .attr("fill", strokeColor)
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(`${sd > 0 ? '+' : ''}${sd}SD`);
      }
    });

    // タイトル
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "#0066cc")
      .text(`Cross-sectional Growth Chart for ${gender === 'male' ? 'Boys' : 'Girls'} (0-18 yrs)`);

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("(The 2000 National Growth Survey on Preschool Children & School Health Statistics Research)");

    // 患者情報
    g.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`患者ID: ${patientId} / 名前: ${childName}`);

    // 中央ラベル
    g.append("text")
      .attr("x", width / 2)
      .attr("y", yScaleHeight(140))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("LENGTH / HEIGHT");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", yScaleHeight(70))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("WEIGHT");

    // 測定データのプロット
    if (measurements && measurements.length > 0) {
      // 身長データ
      const heightData = measurements.map(m => ({
        age: m.age,
        value: m.height
      })).sort((a, b) => a.age - b.age);

      g.append("path")
        .datum(heightData)
        .attr("fill", "none")
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("d", lineHeight);

      g.selectAll(".height-dot")
        .data(heightData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScaleHeight(d.value))
        .attr("r", 4)
        .attr("fill", "#ff0000")
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 1);

      // 体重データ
      const weightData = measurements.map(m => ({
        age: m.age,
        value: m.weight
      })).sort((a, b) => a.age - b.age);

      g.append("path")
        .datum(weightData)
        .attr("fill", "none")
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 2)
        .attr("d", lineWeight);

      g.selectAll(".weight-dot")
        .data(weightData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScaleWeight(d.value))
        .attr("r", 4)
        .attr("fill", "#ff0000")
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 1);
    }

    // 注釈テキスト
    g.append("text")
      .attr("x", 10)
      .attr("y", height - 40)
      .style("font-size", "10px")
      .style("fill", "#666")
      .text("The dotted lines of the -2.5 SD and -3.0 SD indicate the criteria for starting growth hormone (GH) treatment for");
    
    g.append("text")
      .attr("x", 10)
      .attr("y", height - 25)
      .style("font-size", "10px")
      .style("fill", "#666")
      .text("GH deficiency and achondroplasia, respectively, which are included in the Japanese Medical Aid Program for");
    
    g.append("text")
      .attr("x", 10)
      .attr("y", height - 10)
      .style("font-size", "10px")
      .style("fill", "#666")
      .text("Specific Pediatric Chronic Diseases.");

    // 著作権表示
    g.append("text")
      .attr("x", 10)
      .attr("y", height + 70)
      .style("font-size", "9px")
      .style("fill", "#999")
      .text("© The Japanese Society for Pediatric Endocrinology");

  }, [measurements, gender, childName, patientId]);

  return <svg ref={svgRef} style={{ backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}></svg>;
}

function App() {
  const [childInfo, setChildInfo] = useState({
    patientId: '',
    fullName: '',
    birthDate: '',
    gender: 'male'
  });

  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: ''
  });

  const handleChildInfoChange = (e) => {
    const { name, value } = e.target;
    setChildInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setCurrentMeasurement(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (birthDate, measurementDate) => {
    const birth = new Date(birthDate);
    const measurement = new Date(measurementDate);
    const ageInMonths = (measurement - birth) / (1000 * 60 * 60 * 24 * 30.44);
    return ageInMonths / 12;
  };

  const addMeasurement = () => {
    if (!childInfo.birthDate || !currentMeasurement.height || !currentMeasurement.weight) {
      alert('必要な情報を全て入力してください');
      return;
    }

    const age = calculateAge(childInfo.birthDate, currentMeasurement.date);
    if (age < 0 || age > 18) {
      alert('年齢が0-18歳の範囲外です');
      return;
    }

    const newMeasurement = {
      ...currentMeasurement,
      age,
      height: parseFloat(currentMeasurement.height),
      weight: parseFloat(currentMeasurement.weight)
    };

    setMeasurements([...measurements, newMeasurement]);
    setCurrentMeasurement({
      date: new Date().toISOString().split('T')[0],
      height: '',
      weight: ''
    });
  };

  const deleteMeasurement = (index) => {
    if (window.confirm('この記録を削除してもよろしいですか？')) {
      const newMeasurements = [...measurements];
      newMeasurements.splice(index, 1);
      setMeasurements(newMeasurements);
    }
  };

  const downloadChart = () => {
    const svgElement = document.querySelector('svg');
    if (!svgElement) {
      alert('グラフが見つかりません。');
      return;
    }
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          お子様の成長記録
        </h1>

        {/* 子供の情報入力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">お子様の情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                患者ID（不明な場合は0）
              </label>
              <input
                type="text"
                name="patientId"
                value={childInfo.patientId}
                onChange={handleChildInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前（フルネーム）
              </label>
              <input
                type="text"
                name="fullName"
                value={childInfo.fullName}
                onChange={handleChildInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="山田太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                生年月日
              </label>
              <input
                type="date"
                name="birthDate"
                value={childInfo.birthDate}
                onChange={handleChildInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性別
              </label>
              <select
                name="gender"
                value={childInfo.gender}
                onChange={handleChildInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">男の子</option>
                <option value="female">女の子</option>
              </select>
            </div>
          </div>
        </div>

        {/* 測定値入力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">測定値の入力</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                測定日
              </label>
              <input
                type="date"
                name="date"
                value={currentMeasurement.date}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                身長 (cm)
              </label>
              <input
                type="number"
                name="height"
                value={currentMeasurement.height}
                onChange={handleMeasurementChange}
                step="0.1"
                min="30"
                max="190"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                体重 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={currentMeasurement.weight}
                onChange={handleMeasurementChange}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15.5"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addMeasurement}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                記録を追加
              </button>
            </div>
          </div>
        </div>

        {/* 記録履歴 */}
        {measurements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">記録履歴</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      測定日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年齢
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      身長 (cm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      体重 (kg)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {measurements.map((m, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {m.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {m.age.toFixed(1)}歳
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {m.height}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {m.weight}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => deleteMeasurement(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                          title="削除"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 成長曲線グラフ */}
        {childInfo.birthDate && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">成長曲線</h2>
              <button
                onClick={downloadChart}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                グラフをダウンロード
              </button>
            </div>
            
            <div className="overflow-x-auto flex justify-center">
              <CombinedGrowthChart 
                measurements={measurements} 
                gender={childInfo.gender}
                childName={childInfo.fullName}
                patientId={childInfo.patientId || '0'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;