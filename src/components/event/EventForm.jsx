import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

const EventForm = ({ formData, handleChange, handleSubmit, isSubmitting, submitText }) => {
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="datetime">Date and Time</Label>
                    <Input
                        id="datetime"
                        name="datetime"
                        type="datetime-local"
                        value={formData.datetime}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="max_participation">Maximum Participants</Label>
                    <Input
                        id="max_participation"
                        name="max_participation"
                        type="number"
                        min="1"
                        value={formData.max_participation}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <DialogFooter>
                <Button className="mt-2" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : submitText}
                </Button>
            </DialogFooter>
        </form>
    );
};
export default EventForm;