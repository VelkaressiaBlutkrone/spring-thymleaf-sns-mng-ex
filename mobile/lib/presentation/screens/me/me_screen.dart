// 마이페이지 화면. TASK_MOBILE Step 9
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/app_providers.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/models/models.dart';
import '../../../shared/utils/url_helper.dart';
import '../../../shared/widgets/common/app_error_view.dart';
import '../../../shared/widgets/common/empty_widget.dart';
import '../../../shared/widgets/common/loading_widget.dart';
import '../../providers/auth_provider.dart';

/// 마이페이지 (인증 필요)
class MeScreen extends ConsumerStatefulWidget {
  const MeScreen({super.key});

  @override
  ConsumerState<MeScreen> createState() => _MeScreenState();
}

class _MeScreenState extends ConsumerState<MeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _showEditProfileDialog() async {
    final authState = ref.read(authNotifierProvider);
    if (authState is! AuthAuthenticated) return;

    final controller = TextEditingController(text: authState.member.nickname);
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('개인정보 수정'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: '닉네임',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('저장'),
          ),
        ],
      ),
    );

    if (saved != true || !mounted) return;

    final newNickname = controller.text.trim();
    if (newNickname.isEmpty || newNickname == authState.member.nickname) return;

    try {
      await memberRepository.updateMe(
        MemberUpdateRequest(nickname: newNickname),
      );
      await ref.read(authNotifierProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('프로필이 수정되었습니다.')),
        );
      }
    } on AppException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    }
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final member = authState is AuthAuthenticated ? authState.member : null;

    if (member == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('마이페이지')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('마이페이지'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: '프로필 수정',
            onPressed: _showEditProfileDialog,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: '로그아웃',
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go(AppRoutes.login);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 프로필 헤더
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  child: Text(
                    member.nickname.isNotEmpty
                        ? member.nickname[0].toUpperCase()
                        : '?',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        member.nickname,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        member.email,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '가입일: ${member.createdAt.split('T').first}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // 탭 바
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: '게시글'),
              Tab(text: '이미지'),
              Tab(text: 'Pin'),
            ],
          ),
          // 탭 내용
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: const [
                _MyPostsTab(),
                _MyImagePostsTab(),
                _MyPinsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 내 게시글 탭
class _MyPostsTab extends StatefulWidget {
  const _MyPostsTab();

  @override
  State<_MyPostsTab> createState() => _MyPostsTabState();
}

class _MyPostsTabState extends State<_MyPostsTab>
    with AutomaticKeepAliveClientMixin {
  late Future<PageResponse<PostResponse>> _future;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _future = postRepository.getMine();
  }

  void _reload() {
    setState(() {
      _future = postRepository.getMine();
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return FutureBuilder<PageResponse<PostResponse>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const LoadingWidget();
        }
        if (snapshot.hasError) {
          return AppErrorView(
            message: snapshot.error.toString(),
            onRetry: _reload,
          );
        }
        final posts = snapshot.data!.content;
        if (posts.isEmpty) {
          return const EmptyWidget(message: '작성한 게시글이 없습니다.');
        }
        return RefreshIndicator(
          onRefresh: () async => _reload(),
          child: ListView.separated(
            padding: const EdgeInsets.all(8),
            itemCount: posts.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final post = posts[index];
              return ListTile(
                title: Text(post.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(post.createdAt.split('T').first),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push(AppRoutes.postDetailPath(post.id)),
              );
            },
          ),
        );
      },
    );
  }
}

/// 내 이미지 게시글 탭
class _MyImagePostsTab extends StatefulWidget {
  const _MyImagePostsTab();

  @override
  State<_MyImagePostsTab> createState() => _MyImagePostsTabState();
}

class _MyImagePostsTabState extends State<_MyImagePostsTab>
    with AutomaticKeepAliveClientMixin {
  late Future<PageResponse<ImagePostResponse>> _future;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _future = imagePostRepository.getMine();
  }

  void _reload() {
    setState(() {
      _future = imagePostRepository.getMine();
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return FutureBuilder<PageResponse<ImagePostResponse>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const LoadingWidget();
        }
        if (snapshot.hasError) {
          return AppErrorView(
            message: snapshot.error.toString(),
            onRetry: _reload,
          );
        }
        final posts = snapshot.data!.content;
        if (posts.isEmpty) {
          return const EmptyWidget(message: '작성한 이미지 게시글이 없습니다.');
        }
        return RefreshIndicator(
          onRefresh: () async => _reload(),
          child: ListView.separated(
            padding: const EdgeInsets.all(8),
            itemCount: posts.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final post = posts[index];
              return ListTile(
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Image.network(
                    toAbsoluteUrl(post.imageUrl),
                    width: 48,
                    height: 48,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) =>
                        const Icon(Icons.broken_image, size: 48),
                  ),
                ),
                title: Text(post.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(post.createdAt.split('T').first),
                trailing: const Icon(Icons.chevron_right),
                onTap: () =>
                    context.push(AppRoutes.imagePostDetailPath(post.id)),
              );
            },
          ),
        );
      },
    );
  }
}

/// 내 Pin 탭
class _MyPinsTab extends StatefulWidget {
  const _MyPinsTab();

  @override
  State<_MyPinsTab> createState() => _MyPinsTabState();
}

class _MyPinsTabState extends State<_MyPinsTab>
    with AutomaticKeepAliveClientMixin {
  late Future<PageResponse<PinResponse>> _future;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _future = pinRepository.getMyPins();
  }

  void _reload() {
    setState(() {
      _future = pinRepository.getMyPins();
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return FutureBuilder<PageResponse<PinResponse>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const LoadingWidget();
        }
        if (snapshot.hasError) {
          return AppErrorView(
            message: snapshot.error.toString(),
            onRetry: _reload,
          );
        }
        final pins = snapshot.data!.content;
        if (pins.isEmpty) {
          return const EmptyWidget(message: '등록한 Pin이 없습니다.');
        }
        return RefreshIndicator(
          onRefresh: () async => _reload(),
          child: ListView.separated(
            padding: const EdgeInsets.all(8),
            itemCount: pins.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final pin = pins[index];
              return ListTile(
                leading: const Icon(Icons.location_on_outlined),
                title: Text(
                  pin.description ?? 'Pin #${pin.id}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  '${pin.latitude.toStringAsFixed(4)}, ${pin.longitude.toStringAsFixed(4)}',
                ),
                trailing: const Icon(Icons.chevron_right),
              );
            },
          ),
        );
      },
    );
  }
}
