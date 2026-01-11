import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Posts from "./Posts";
import * as queries from "../api/queries";
import * as commands from "../api/commands";
import type { User, Post } from "../types";

// Mock the queries and commands modules
vi.mock("../api/queries");
vi.mock("../api/commands");

// Helper function to render component with QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("Posts", () => {
  const mockUser: User = {
    id: "user-1",
    username: "testuser",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockPosts: Post[] = [
    {
      id: "post-1",
      content: "First post content",
      userId: "user-1",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "post-2",
      content: "Second post content",
      userId: "user-1",
      createdAt: "2024-01-01T11:00:00Z",
      updatedAt: "2024-01-01T11:00:00Z",
    },
  ];

  const mockUseUserByUsername = vi.fn();
  const mockUsePosts = vi.fn();
  const mockUseCreatePost = vi.fn();
  const mockUseUpdatePost = vi.fn();
  const mockUseDeletePost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (queries.useUserByUsername as any) = mockUseUserByUsername;
    (queries.usePosts as any) = mockUsePosts;
    (commands.useCreatePost as any) = mockUseCreatePost;
    (commands.useUpdatePost as any) = mockUseUpdatePost;
    (commands.useDeletePost as any) = mockUseDeletePost;

    mockUseUserByUsername.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    mockUsePosts.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: null,
    });

    mockUseCreatePost.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockUseUpdatePost.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    mockUseDeletePost.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Loading states", () => {
    it("should show loading message when user is loading", () => {
      mockUseUserByUsername.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithQueryClient(<Posts username="testuser" />);
      expect(screen.getByText("Loading posts...")).toBeInTheDocument();
    });

    it("should show loading message when posts are loading", () => {
      mockUsePosts.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithQueryClient(<Posts username="testuser" />);
      expect(screen.getByText("Loading posts...")).toBeInTheDocument();
    });
  });

  describe("Error states", () => {
    it("should display error message when posts fail to load", () => {
      mockUsePosts.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: "Failed to fetch posts" },
      });

      renderWithQueryClient(<Posts username="testuser" />);
      expect(
        screen.getByText("Error loading posts: Failed to fetch posts")
      ).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it('should show "No posts yet" when there are no posts', () => {
      mockUsePosts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderWithQueryClient(<Posts username="testuser" />);
      expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    });
  });

  describe("Rendering posts", () => {
    it("should render posts correctly", () => {
      renderWithQueryClient(<Posts username="testuser" />);

      expect(screen.getByText("Posts")).toBeInTheDocument();
      expect(screen.getByText("First post content")).toBeInTheDocument();
      expect(screen.getByText("Second post content")).toBeInTheDocument();
    });

    it("should render post timestamps", () => {
      renderWithQueryClient(<Posts username="testuser" />);

      const post1 = screen
        .getByText("First post content")
        .closest(".bg-gray-800");
      expect(post1).toBeInTheDocument();
      if (post1) {
        expect(
          within(post1 as HTMLElement).getByText(/2024/i)
        ).toBeInTheDocument();
      }
    });
  });

  describe("Creating posts", () => {
    it("should render create post form when not in read-only mode", () => {
      renderWithQueryClient(<Posts username="testuser" />);

      expect(
        screen.getByPlaceholderText("What's happening?")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Post" })).toBeInTheDocument();
    });

    it("should not render create post form in read-only mode", () => {
      renderWithQueryClient(<Posts username="testuser" readOnly />);

      expect(
        screen.queryByPlaceholderText("What's happening?")
      ).not.toBeInTheDocument();
    });

    it("should update character count as user types", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, "Hello");

      expect(screen.getByText("5/280")).toBeInTheDocument();
    });

    it("should disable post button when content is empty", () => {
      renderWithQueryClient(<Posts username="testuser" />);

      const postButton = screen.getByRole("button", { name: "Post" });
      expect(postButton).toBeDisabled();
    });

    it("should enable post button when content is not empty", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, "New post");

      const postButton = screen.getByRole("button", { name: "Post" });
      expect(postButton).not.toBeDisabled();
    });

    it("should create post when submit button is clicked", async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreatePost.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, "New post content");

      const postButton = screen.getByRole("button", { name: "Post" });
      await user.click(postButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          content: "New post content",
        });
      });

      expect(textarea).toHaveValue("");
    });

    it("should show loading state when creating post", () => {
      mockUseCreatePost.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: true,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const postButton = screen.getByRole("button", { name: "Posting..." });
      expect(postButton).toBeDisabled();
    });

    it("should not create post with only whitespace", async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreatePost.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const textarea = screen.getByPlaceholderText("What's happening?");
      await user.type(textarea, "   ");

      const postButton = screen.getByRole("button", { name: "Post" });
      expect(postButton).toBeDisabled();

      // Even if somehow clicked, it shouldn't call mutateAsync
      await user.click(postButton);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Editing posts", () => {
    it("should show edit form when edit button is clicked", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const textarea = screen.getByDisplayValue("First post content");
      expect(textarea).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("should not show edit buttons in read-only mode", () => {
      renderWithQueryClient(<Posts username="testuser" readOnly />);

      expect(
        screen.queryByRole("button", { name: "Edit" })
      ).not.toBeInTheDocument();
    });

    it("should update post when save button is clicked", async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseUpdatePost.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const textarea = screen.getByDisplayValue("First post content");
      await user.clear(textarea);
      await user.type(textarea, "Updated content");

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: "post-1",
          content: "Updated content",
        });
      });
    });

    it("should cancel editing when cancel button is clicked", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      // Should show original post content again
      expect(screen.getByText("First post content")).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue("First post content")
      ).not.toBeInTheDocument();
    });

    it("should disable save button when content is empty", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const textarea = screen.getByDisplayValue("First post content");
      await user.clear(textarea);

      const saveButton = screen.getByRole("button", { name: "Save" });
      expect(saveButton).toBeDisabled();
    });

    it("should show loading state when updating post", async () => {
      const user = userEvent.setup();
      mockUseUpdatePost.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: true,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const saveButton = screen.getByRole("button", { name: "Updating..." });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("Deleting posts", () => {
    it("should show delete button for each post", () => {
      renderWithQueryClient(<Posts username="testuser" />);

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      expect(deleteButtons).toHaveLength(2);
    });

    it("should not show delete buttons in read-only mode", () => {
      renderWithQueryClient(<Posts username="testuser" readOnly />);

      expect(
        screen.queryByRole("button", { name: "Delete" })
      ).not.toBeInTheDocument();
    });

    it("should confirm before deleting post", async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseDeletePost.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      renderWithQueryClient(<Posts username="testuser" />);

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        "Are you sure you want to delete this post?"
      );
      expect(mockMutateAsync).toHaveBeenCalledWith("post-1");

      confirmSpy.mockRestore();
    });

    it("should not delete post if confirmation is cancelled", async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseDeletePost.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      renderWithQueryClient(<Posts username="testuser" />);

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockMutateAsync).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it("should show loading state when deleting post", () => {
      mockUseDeletePost.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: true,
      });

      renderWithQueryClient(<Posts username="testuser" />);

      const deleteButtons = screen.getAllByRole("button", {
        name: "Deleting...",
      });
      expect(deleteButtons.length).toBeGreaterThan(0);
      deleteButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Character limit", () => {
    it("should enforce 280 character limit in create post textarea", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const textarea = screen.getByPlaceholderText(
        "What's happening?"
      ) as HTMLTextAreaElement;
      const longContent = "a".repeat(280);

      await user.type(textarea, longContent);

      expect(textarea.value).toHaveLength(280);
      expect(textarea.maxLength).toBe(280);
    });

    it("should enforce 280 character limit in edit post textarea", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<Posts username="testuser" />);

      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      await user.click(editButtons[0]);

      const textarea = screen.getByDisplayValue(
        "First post content"
      ) as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(280);
    });
  });
});
