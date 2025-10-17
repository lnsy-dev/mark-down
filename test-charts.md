# Chart Block Test

This document tests the new chart block functionality.

## Bar Chart Example

```chart
type: bar
width: 500
height: 300
orientation: vertical
data:
  - label: "Q1"
    value: 100
    color: "#ff6b6b"
  - label: "Q2"
    value: 150
    color: "#4ecdc4"
  - label: "Q3"
    value: 200
    color: "#45b7d1"
  - label: "Q4"
    value: 175
    color: "#96ceb4"
```

## Scatter Plot Example

```chart
type: scatter
width: 400
height: 400
data:
  - x: 10
    y: 20
    r: 5
    c: "Group A"
  - x: 20
    y: 30
    r: 8
    c: "Group B"
  - x: 30
    y: 25
    r: 6
    c: "Group A"
  - x: 40
    y: 35
    r: 10
    c: "Group B"
```

## Line Chart Example

```chart
type: line
width: 600
height: 250
line-width: 3
data:
  - x: 1
    y: 10
    c: "Series 1"
  - x: 2
    y: 15
    c: "Series 1"
  - x: 3
    y: 12
    c: "Series 1"
  - x: 4
    y: 18
    c: "Series 1"
  - x: 1
    y: 8
    c: "Series 2"
  - x: 2
    y: 12
    c: "Series 2"
  - x: 3
    y: 16
    c: "Series 2"
  - x: 4
    y: 14
    c: "Series 2"
```

## Donut Chart Example

```chart
type: donut
width: 300
height: 300
labels: true
data:
  - label: "Desktop"
    value: 45
  - label: "Mobile"
    value: 35
  - label: "Tablet"
    value: 20
```

## Monochrome Bar Chart

```chart
type: bar
width: 400
height: 300
monochrome: true
orientation: horizontal
data:
  - label: "Category A"
    value: 85
  - label: "Category B"
    value: 70
  - label: "Category C"
    value: 95
  - label: "Category D"
    value: 60
```