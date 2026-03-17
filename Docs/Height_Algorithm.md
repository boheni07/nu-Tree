## **\[분야 5\] 모바일 수고 산정 알고리즘 (Height\_Algorithm.md)**

### **1\. 산정 원리 (Triangulation)**

사용자가 서 있는 위치에서 스마트폰의 지면 높이와 각도를 이용하여 가로수와의 거리($D$)를 먼저 구하고, 나무 꼭대기를 바라보는 각도를 통해 전체 수고($H$)를 계산함.

* **변수 정의:**  
  * $h$: 스마트폰을 들고 있는 높이 (지면으로부터의 단말기 높이)  
  * $\\theta\_{base}$: 나무 뿌리 지점을 향했을 때의 기기 기울기 (Pitch)  
  * $\\theta\_{top}$: 나무 최상단 지점을 향했을 때의 기기 기울기 (Pitch)  
  * $D$: 촬영자와 가로수 사이의 수평 거리  
  * $H$: 최종 가로수 수고

### **2\. 핵심 소스코드 (Dart/Flutter)**

Dart

import 'dart:math' as math;

class TreeMeasurement {  
  /// 수고(Height) 산정 함수  
  /// \[deviceHeight\]: 지면에서 스마트폰까지의 높이 (단위: m)  
  /// \[pitchBase\]: 나무 바닥을 향했을 때의 Pitch 각도 (단위: Degree)  
  /// \[pitchTop\]: 나무 꼭대기를 향했을 때의 Pitch 각도 (단위: Degree)  
  static Map\<String, double\> calculateTreeMetrics({  
    required double deviceHeight,  
    required double pitchBase,  
    required double pitchTop,  
  }) {  
    // 1\. Degree를 Radian으로 변환 (math.tan은 라디안 사용)  
    double radBase \= \_degreeToRadian(pitchBase.abs());  
    double radTop \= \_degreeToRadian(pitchTop.abs());

    // 2\. 촬영자와 가로수 간의 수평 거리(D) 계산  
    // 공식: D \= h \* tan(90 \- theta\_base)  
    // 여기서는 기기 기울기(Pitch) 기준이 수평이 0도인 경우를 가정함  
    double distance \= deviceHeight \* math.tan(math.pi / 2 \- radBase);

    // 3\. 나무의 상단부 높이(h\_top) 계산  
    // 공식: h\_top \= D \* tan(theta\_top)  
    double topPartHeight \= distance \* math.tan(radTop);

    // 4\. 전체 수고(H) \= 상단부 높이 \+ 기기 높이  
    double totalHeight \= topPartHeight \+ deviceHeight;

    return {  
      'distance': double.parse(distance.toStringAsFixed(2)),  
      'treeHeight': double.parse(totalHeight.toStringAsFixed(2)),  
    };  
  }

  static double \_degreeToRadian(double degree) {  
    return degree \* (math.pi / 180);  
  }  
}

// 사용 예시  
void main() {  
  var result \= TreeMeasurement.calculateTreeMetrics(  
    deviceHeight: 1.5, // 1.5미터 높이에서 촬영  
    pitchBase: 30.0,   // 바닥을 향해 30도 숙임  
    pitchTop: 45.0,    // 꼭대기를 향해 45도 들어올림  
  );  
    
  print("가로수 거리: ${result\['distance'\]}m");  
  print("가로수 수고: ${result\['treeHeight'\]}m");  
}

### ---

**3\. 구현 시 주의사항**

* **센서 데이터 보정:** 자이로 센서의 로우 데이터는 노이즈가 심하므로 **상보 필터(Complementary Filter)** 또는 \*\*칼만 필터(Kalman Filter)\*\*를 적용하여 안정적인 각도 값을 추출해야 함.  
* **Pitch 기준점:** 스마트폰이 수평일 때를 $0^\\circ$로 볼 것인지, 수직일 때를 $0^\\circ$로 볼 것인지에 따라 math.pi / 2 보정 여부를 결정해야 함. (위 코드는 수평 $0^\\circ$ 기준)  
* **사용자 가이드 UI:** 앱 화면 중앙에 십자선(Crosshair)을 배치하여 사용자가 정확히 뿌리 지점과 꼭대기 지점을 조준하고 확정(Capture) 버튼을 누르게 유도해야 함.