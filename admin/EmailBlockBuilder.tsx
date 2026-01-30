import { useState, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GripVertical,
  Type,
  Image,
  MousePointer,
  Minus,
  Square,
  Layout,
  Columns2,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'columns' | 'heading';
  content: Record<string, any>;
}

interface EmailBlockBuilderProps {
  blocks: EmailBlock[];
  onBlocksChange: (blocks: EmailBlock[]) => void;
}

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'text', label: 'Text', icon: AlignLeft },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'button', label: 'Button', icon: MousePointer },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'spacer', label: 'Spacer', icon: Square },
  { type: 'columns', label: '2 Columns', icon: Columns2 },
] as const;

const generateId = () => Math.random().toString(36).substring(2, 9);

const getDefaultContent = (type: EmailBlock['type']): Record<string, any> => {
  switch (type) {
    case 'heading':
      return { text: 'Your Heading Here', level: 'h1', align: 'left' };
    case 'text':
      return { text: 'Your text content goes here. Click to edit.', align: 'left' };
    case 'image':
      return { url: '', alt: 'Image description', width: '100%', align: 'center' };
    case 'button':
      return { text: 'Click Here', url: '#', backgroundColor: '#3b82f6', textColor: '#ffffff', align: 'center' };
    case 'divider':
      return { color: '#e5e7eb', thickness: 1 };
    case 'spacer':
      return { height: 20 };
    case 'columns':
      return { 
        left: { text: 'Left column content' }, 
        right: { text: 'Right column content' } 
      };
    default:
      return {};
  }
};

interface BlockItemProps {
  block: EmailBlock;
  onUpdate: (id: string, content: Record<string, any>) => void;
  onDelete: (id: string) => void;
}

function BlockItem({ block, onUpdate, onDelete }: BlockItemProps) {
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = block.content.level as 'h1' | 'h2' | 'h3';
        return (
          <div style={{ textAlign: block.content.align }}>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={block.content.text}
                  onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Select
                    value={block.content.level}
                    onValueChange={(v) => onUpdate(block.id, { ...block.content, level: v })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">H1</SelectItem>
                      <SelectItem value="h2">H2</SelectItem>
                      <SelectItem value="h3">H3</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlignmentButtons
                    value={block.content.align}
                    onChange={(v) => onUpdate(block.id, { ...block.content, align: v })}
                  />
                </div>
              </div>
            ) : (
              <HeadingTag
                className={`${HeadingTag === 'h1' ? 'text-2xl' : HeadingTag === 'h2' ? 'text-xl' : 'text-lg'} font-bold cursor-pointer`}
                onClick={() => setIsEditing(true)}
              >
                {block.content.text || 'Click to edit heading'}
              </HeadingTag>
            )}
          </div>
        );

      case 'text':
        return isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={block.content.text}
              onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
              onBlur={() => setIsEditing(false)}
              autoFocus
              rows={3}
            />
            <AlignmentButtons
              value={block.content.align}
              onChange={(v) => onUpdate(block.id, { ...block.content, align: v })}
            />
          </div>
        ) : (
          <p
            className="cursor-pointer text-sm"
            style={{ textAlign: block.content.align }}
            onClick={() => setIsEditing(true)}
          >
            {block.content.text || 'Click to edit text'}
          </p>
        );

      case 'image':
        return (
          <div style={{ textAlign: block.content.align }}>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  placeholder="Image URL"
                  value={block.content.url}
                  onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
                />
                <Input
                  placeholder="Alt text"
                  value={block.content.alt}
                  onChange={(e) => onUpdate(block.id, { ...block.content, alt: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Width (e.g., 100%, 300px)"
                    value={block.content.width}
                    onChange={(e) => onUpdate(block.id, { ...block.content, width: e.target.value })}
                    className="w-32"
                  />
                  <AlignmentButtons
                    value={block.content.align}
                    onChange={(v) => onUpdate(block.id, { ...block.content, align: v })}
                  />
                  <Button size="sm" onClick={() => setIsEditing(false)}>Done</Button>
                </div>
              </div>
            ) : block.content.url ? (
              <img
                src={block.content.url}
                alt={block.content.alt}
                style={{ width: block.content.width, display: 'inline-block' }}
                className="cursor-pointer max-w-full"
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/30 p-8 text-center cursor-pointer hover:border-primary transition-colors rounded"
                onClick={() => setIsEditing(true)}
              >
                <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to add image URL</p>
              </div>
            )}
          </div>
        );

      case 'button':
        return isEditing ? (
          <div className="space-y-2">
            <Input
              placeholder="Button text"
              value={block.content.text}
              onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
            />
            <Input
              placeholder="Button URL"
              value={block.content.url}
              onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
            />
            <div className="flex gap-2 items-center">
              <Label className="text-xs">BG:</Label>
              <input
                type="color"
                value={block.content.backgroundColor}
                onChange={(e) => onUpdate(block.id, { ...block.content, backgroundColor: e.target.value })}
                className="w-8 h-8 cursor-pointer"
              />
              <Label className="text-xs">Text:</Label>
              <input
                type="color"
                value={block.content.textColor}
                onChange={(e) => onUpdate(block.id, { ...block.content, textColor: e.target.value })}
                className="w-8 h-8 cursor-pointer"
              />
              <AlignmentButtons
                value={block.content.align}
                onChange={(v) => onUpdate(block.id, { ...block.content, align: v })}
              />
              <Button size="sm" onClick={() => setIsEditing(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: block.content.align }}>
            <button
              className="px-6 py-2 rounded font-medium cursor-pointer"
              style={{
                backgroundColor: block.content.backgroundColor,
                color: block.content.textColor,
              }}
              onClick={() => setIsEditing(true)}
            >
              {block.content.text || 'Button'}
            </button>
          </div>
        );

      case 'divider':
        return (
          <div className="py-2" onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <div className="flex gap-2 items-center">
                <Label className="text-xs">Color:</Label>
                <input
                  type="color"
                  value={block.content.color}
                  onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
                  className="w-8 h-8 cursor-pointer"
                />
                <Label className="text-xs">Thickness:</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={block.content.thickness}
                  onChange={(e) => onUpdate(block.id, { ...block.content, thickness: parseInt(e.target.value) || 1 })}
                  className="w-16"
                />
                <Button size="sm" onClick={() => setIsEditing(false)}>Done</Button>
              </div>
            ) : (
              <hr
                className="cursor-pointer"
                style={{
                  borderColor: block.content.color,
                  borderWidth: `${block.content.thickness}px`,
                }}
              />
            )}
          </div>
        );

      case 'spacer':
        return (
          <div onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <div className="flex gap-2 items-center">
                <Label className="text-xs">Height (px):</Label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={block.content.height}
                  onChange={(e) => onUpdate(block.id, { ...block.content, height: parseInt(e.target.value) || 20 })}
                  className="w-20"
                />
                <Button size="sm" onClick={() => setIsEditing(false)}>Done</Button>
              </div>
            ) : (
              <div
                className="bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground cursor-pointer"
                style={{ height: block.content.height }}
              >
                {block.content.height}px spacer
              </div>
            )}
          </div>
        );

      case 'columns':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-dashed border-muted-foreground/30 p-2 rounded">
              <Textarea
                placeholder="Left column"
                value={block.content.left?.text || ''}
                onChange={(e) => onUpdate(block.id, {
                  ...block.content,
                  left: { ...block.content.left, text: e.target.value }
                })}
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="border border-dashed border-muted-foreground/30 p-2 rounded">
              <Textarea
                placeholder="Right column"
                value={block.content.right?.text || ''}
                onChange={(e) => onUpdate(block.id, {
                  ...block.content,
                  right: { ...block.content.right, text: e.target.value }
                })}
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={controls}
      className="bg-card border border-border rounded-lg p-3 shadow-sm"
    >
      <div className="flex gap-2">
        <div
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          {renderBlockContent()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(block.id)}
          className="text-destructive hover:text-destructive shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

function AlignmentButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex border rounded overflow-hidden">
      {[
        { value: 'left', icon: AlignLeft },
        { value: 'center', icon: AlignCenter },
        { value: 'right', icon: AlignRight },
      ].map(({ value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          className={`p-1.5 ${value === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          onClick={() => onChange(v)}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

export function EmailBlockBuilder({ blocks, onBlocksChange }: EmailBlockBuilderProps) {
  const addBlock = useCallback((type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
    };
    onBlocksChange([...blocks, newBlock]);
  }, [blocks, onBlocksChange]);

  const updateBlock = useCallback((id: string, content: Record<string, any>) => {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, content } : b));
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id: string) => {
    onBlocksChange(blocks.filter(b => b.id !== id));
  }, [blocks, onBlocksChange]);

  return (
    <div className="flex gap-4 h-[500px]">
      {/* Block Palette */}
      <div className="w-48 shrink-0 space-y-2">
        <Label className="text-sm font-medium">Content Blocks</Label>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addBlock(type as EmailBlock['type'])}
              className="flex flex-col items-center gap-1 p-3 border border-border rounded-lg hover:bg-muted/50 hover:border-primary transition-colors text-center"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">{label}</span>
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Click a block to add it, then drag to reorder.
        </p>
      </div>

      {/* Canvas */}
      <div className="flex-1 border border-border rounded-lg bg-background overflow-auto">
        <div className="p-4 min-h-full">
          {blocks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Layout className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Click blocks on the left to add them here</p>
              </div>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={blocks}
              onReorder={onBlocksChange}
              className="space-y-3"
            >
              {blocks.map((block) => (
                <BlockItem
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}

export function blocksToHtml(blocks: EmailBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const Tag = block.content.level || 'h1';
        const fontSize = Tag === 'h1' ? '24px' : Tag === 'h2' ? '20px' : '16px';
        return `<${Tag} style="margin: 0 0 16px; font-size: ${fontSize}; font-weight: bold; text-align: ${block.content.align};">${block.content.text}</${Tag}>`;
      
      case 'text':
        return `<p style="margin: 0 0 16px; text-align: ${block.content.align};">${block.content.text}</p>`;
      
      case 'image':
        if (!block.content.url) return '';
        return `<div style="text-align: ${block.content.align}; margin: 0 0 16px;"><img src="${block.content.url}" alt="${block.content.alt}" style="max-width: 100%; width: ${block.content.width};" /></div>`;
      
      case 'button':
        return `<div style="text-align: ${block.content.align}; margin: 0 0 16px;"><a href="${block.content.url}" style="display: inline-block; padding: 12px 24px; background-color: ${block.content.backgroundColor}; color: ${block.content.textColor}; text-decoration: none; border-radius: 4px; font-weight: 500;">${block.content.text}</a></div>`;
      
      case 'divider':
        return `<hr style="border: none; border-top: ${block.content.thickness}px solid ${block.content.color}; margin: 16px 0;" />`;
      
      case 'spacer':
        return `<div style="height: ${block.content.height}px;"></div>`;
      
      case 'columns':
        return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;"><tr><td width="50%" style="padding-right: 8px; vertical-align: top;">${block.content.left?.text || ''}</td><td width="50%" style="padding-left: 8px; vertical-align: top;">${block.content.right?.text || ''}</td></tr></table>`;
      
      default:
        return '';
    }
  }).filter(Boolean).join('\n');
}

export function htmlToBlocks(html: string): EmailBlock[] {
  // Simple parser - for complex HTML, would need a proper parser
  // This handles basic cases when importing
  const blocks: EmailBlock[] = [];
  
  if (!html || html.trim().length === 0) return blocks;

  // Just return a single text block with the HTML content for now
  // A full implementation would parse the HTML properly
  blocks.push({
    id: generateId(),
    type: 'text',
    content: { text: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), align: 'left' }
  });

  return blocks;
}
