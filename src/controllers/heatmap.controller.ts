import { Response } from 'express';
import { guildService, heatmapService } from '../services';
import { IAuthRequest } from '../interfaces/request.interface';
import { catchAsync, ApiError, timezone, charts } from "../utils";
import { databaseService } from 'tc_dbcomm'
import httpStatus from 'http-status';
import config from '../config';
import moment from 'moment-timezone';

const heatmapChart = catchAsync(async function (req: IAuthRequest, res: Response) {
    if (!await guildService.getGuild({ guildId: req.params.guildId, user: req.user.discordId })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Guild not found');
    }
    const connection = databaseService.connectionFactory(req.params.guildId, config.mongoose.botURL);
    let heatmaps = await heatmapService.getHeatmapChart(connection, req.body);
    const timeZoneOffset = parseInt(moment().tz(req.body.timeZone).format('Z'));
    heatmaps = timezone.shiftHeatmapsHours(heatmaps, timeZoneOffset);
    heatmaps = charts.fillHeatmapChart(heatmaps);
    res.send(heatmaps);
});

const lineGraph = catchAsync(async function (req: IAuthRequest, res: Response) {
    if (!await guildService.getGuild({ guildId: req.params.guildId, user: req.user.discordId })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Guild not found');
    }
    const connection = databaseService.connectionFactory(req.params.guildId, config.mongoose.botURL);
    let lineGraph = await heatmapService.lineGraph(connection, req.body.startDate, req.body.endDate);
    lineGraph = charts.fillHeatmapLineGraph(lineGraph, req.body.startDate, req.body.endDate);
    res.send(lineGraph);
});


export default {
    heatmapChart,
    lineGraph
}

