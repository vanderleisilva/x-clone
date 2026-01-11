import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsService', () => {
  let service: PostsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockPost: Post = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    content: 'Test post content',
    userId: 'user-123',
    user: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts ordered by createdAt DESC', async () => {
      const posts = [
        { ...mockPost, createdAt: new Date('2024-01-02') },
        { ...mockPost, id: 'another-id', createdAt: new Date('2024-01-01') },
      ];
      mockRepository.find.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(result).toEqual(posts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no posts exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a post when found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(postId);

      expect(result).toEqual(mockPost);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(postId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(postId)).rejects.toThrow(
        `Post with ID ${postId} not found`,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return posts for a specific user ordered by createdAt DESC', async () => {
      const userId = 'user-123';
      const posts = [
        { ...mockPost, createdAt: new Date('2024-01-02') },
        { ...mockPost, id: 'another-id', createdAt: new Date('2024-01-01') },
      ];
      mockRepository.find.mockResolvedValue(posts);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(posts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when user has no posts', async () => {
      const userId = 'user-123';
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByUserId(userId);

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new post', async () => {
      const createPostDto: CreatePostDto = {
        content: 'New post content',
        userId: 'user-123',
      };
      const createdPost = { ...mockPost, ...createPostDto };

      mockRepository.create.mockReturnValue(createdPost);
      mockRepository.save.mockResolvedValue(createdPost);

      const result = await service.create(createPostDto);

      expect(result).toEqual(createdPost);
      expect(mockRepository.create).toHaveBeenCalledWith(createPostDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdPost);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update and return the updated post', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const updatePostDto: UpdatePostDto = {
        content: 'Updated post content',
      };
      const updatedPost = { ...mockPost, ...updatePostDto };

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update(postId, updatePostDto);

      expect(result).toEqual(updatedPost);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedPost);
    });

    it('should update only provided fields', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const updatePostDto: UpdatePostDto = {
        content: 'Updated content',
      };
      const updatedPost = { ...mockPost, content: 'Updated content' };

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update(postId, updatePostDto);

      expect(result).toEqual(updatedPost);
      expect(result.content).toBe('Updated content');
      expect(result.userId).toBe(mockPost.userId);
    });

    it('should throw NotFoundException when post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const updatePostDto: UpdatePostDto = {
        content: 'Updated content',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(postId, updatePostDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.remove.mockResolvedValue(mockPost);

      await service.remove(postId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPost);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(postId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});

