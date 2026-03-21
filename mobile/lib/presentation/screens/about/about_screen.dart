// About 화면. TASK_MOBILE Step 10, PRD 3.5
import 'package:flutter/material.dart';

/// 서비스 소개 화면
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 서비스 소개
            Center(
              child: Column(
                children: [
                  Icon(Icons.map, size: 64, color: theme.colorScheme.primary),
                  const SizedBox(height: 12),
                  Text(
                    'MapSNS',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '지도 기반 소셜 네트워크 서비스',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // 컨셉 설명
            _SectionTitle(title: '서비스 소개', theme: theme),
            const SizedBox(height: 8),
            const Text(
              '사용자의 위치를 기반으로 지도에서 게시글을 작성하고, '
              'Pin을 생성하며, 반경 내 정보를 실시간으로 확인할 수 있는 '
              '소셜 네트워크 서비스입니다.\n\n'
              '지도 위에 나만의 장소를 Pin으로 저장하고, 그 장소에 대한 '
              '이야기를 게시글로 공유해보세요.',
            ),
            const SizedBox(height: 24),

            // 주요 기능
            _SectionTitle(title: '주요 기능', theme: theme),
            const SizedBox(height: 8),
            const _FeatureItem(
              icon: Icons.map_outlined,
              title: '지도 기반 탐색',
              description: '현재 위치 주변의 게시글과 Pin을 지도에서 바로 확인',
            ),
            const _FeatureItem(
              icon: Icons.push_pin_outlined,
              title: 'Pin 관리',
              description: '관심 장소를 Pin으로 저장하고 게시글과 연결',
            ),
            const _FeatureItem(
              icon: Icons.article_outlined,
              title: '게시글 작성',
              description: '텍스트 및 이미지 게시글 작성, 위치 정보 연동',
            ),
            const _FeatureItem(
              icon: Icons.explore_outlined,
              title: '반경 조회',
              description: '지정 반경 내 Pin과 게시글 실시간 탐색',
            ),
            const SizedBox(height: 24),

            // 기술 스택
            _SectionTitle(title: '기술 스택', theme: theme),
            const SizedBox(height: 8),
            _TechStackCard(theme: theme, items: const [
              ('Backend', 'Spring Boot 4.0.2 / Java 21'),
              ('Web', 'React 19 / TypeScript / Vite'),
              ('Mobile', 'Flutter / Dart / Riverpod'),
              ('Database', 'MySQL 8.0 / Redis 7'),
              ('인증', 'JWT (Access + Refresh Token)'),
              ('지도', 'Google Maps / Kakao Maps'),
              ('인프라', 'Docker / Docker Compose'),
            ]),
            const SizedBox(height: 32),

            // 버전
            Center(
              child: Text(
                'v1.0.0',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.theme});

  final String title;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 24, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TechStackCard extends StatelessWidget {
  const _TechStackCard({required this.theme, required this.items});

  final ThemeData theme;
  final List<(String, String)> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: items
              .map(
                (item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          item.$1,
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(item.$2, style: theme.textTheme.bodySmall),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}
