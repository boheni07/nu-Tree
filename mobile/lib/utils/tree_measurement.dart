import 'dart:math' as math;

class TreeMeasurement {
  /// 수고(Height) 등 산정 함수
  /// [deviceHeight]: 지면에서 스마트폰까지의 높이 (단위: m)
  /// [pitchBase]: 나무 바닥을 향했을 때의 Pitch 각도 (단위: Degree, 수평을 0으로 가정)
  /// [pitchTop]: 나무 꼭대기를 향했을 때의 Pitch 각도 (단위: Degree)
  /// [horizontalFov]: 카메라 수평 화각 (단위: Degree)
  /// [treePixelWidth]: 화면에 나타난 나무의 픽셀 너비
  /// [imagePixelWidth]: 전체 이미지의 픽셀 너비
  static Map<String, double> calculateTreeMetrics({
    required double deviceHeight,
    required double pitchBase,
    required double pitchTop,
    // DBH를 위한 추가 파라미터들
    double? horizontalFov,
    double? treePixelWidth,
    double? imagePixelWidth,
  }) {
    // 1. Degree를 Radian으로 변환
    double radBase = _degreeToRadian(pitchBase.abs());
    double radTop = _degreeToRadian(pitchTop.abs());

    // 2. 촬영자와 가로수 간의 수평 거리(D) 계산
    // 공식: D = h * tan(90 - theta_base)
    double distance = deviceHeight * math.tan(math.pi / 2 - radBase);

    // 3. 나무의 상단부 높이(h_top) 계산
    double topPartHeight = distance * math.tan(radTop);

    // 4. 전체 수고(H) = 상단부 높이 + 기기 높이 (단, 하향 촬영의 경우 감산 가능성 존재)
    double totalHeight = topPartHeight + deviceHeight;

    double estimatedDbh = 0.0;
    
    // 5. 흉고직경(DBH) 대략적 산정 
    // 화면에 보이는 나무의 너비 픽셀 비율 전체 FOV 각도로 변환하여 거리와 함께 산식 계산
    if (horizontalFov != null && treePixelWidth != null && imagePixelWidth != null) {
      double fovRadian = _degreeToRadian(horizontalFov);
      // 실제 시야 너비(미터) (2 * D * tan(FOV/2))
      double realWorldWidth = 2 * distance * math.tan(fovRadian / 2);
      // 나무 너비(미터) 계산
      double realDbhMeters = (treePixelWidth / imagePixelWidth) * realWorldWidth;
       // DBH는 cm이 표준이므로 100 곱함
      estimatedDbh = realDbhMeters * 100;
    }

    return {
      'distance': double.parse(distance.toStringAsFixed(2)),
      'height': double.parse(totalHeight.toStringAsFixed(2)),
      'dbh': double.parse(estimatedDbh.toStringAsFixed(2)),
      'under_height': 2.0 // 임시 더미 데이터 (실제로는 가지 시작점 Pitch로 유사하게 산정)
    };
  }

  static double _degreeToRadian(double degree) {
    return degree * (math.pi / 180);
  }
}
